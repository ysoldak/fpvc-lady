package main

import (
	"fmt"
	"time"

	"github.com/urfave/cli/v2"
	"github.com/ysoldak/fpvc-lady/internal/game"
	"github.com/ysoldak/fpvc-lady/internal/generate"
	"github.com/ysoldak/fpvc-lady/internal/log"
	"github.com/ysoldak/fpvc-lady/internal/tts"
	"github.com/ysoldak/fpvc-lady/internal/utils"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

var session game.Session
var logger log.Logger
var speaker *tts.Tts
var locale *Locale

var lastHitTime = time.Time{}

var config Config

func commentAction(cc *cli.Context) (err error) {

	// Init config
	config = NewConfigFromContext(cc)

	// Init locale
	locale = NewLocale(config.Locale)

	// TTS
	speak := cc.String(flagSpeakCommand)
	speaker = tts.NewByName(speak, config.Locale) // technically, locale != language, but we expect two-letter locale codes, so they can be used as language codes too

	// Source & Log
	var generator generate.Generator
	source := cc.String(flagSource)
	logFilePath := cc.String(flagLogFile)
	logFromDate := cc.String(flagLogFrom)
	switch {
	case source == "serial" || source == "auto":
		serial, err := utils.NewSerial(source)
		if err != nil {
			return err
		}
		generator = generate.NewWire(serial) // serial port is used for input
		logger = log.NewFile(logFilePath)    // log-file is used for output
	case source == "log":
		generator = generate.NewLog(logFilePath, logFromDate) // log-file is used for input
		logger = log.NewNull()                                // no output
	case source == "demo":
		generator = generate.NewDemo(cc.Int(flagDemoSpeed)) // stream of fake messages is used for input
		logger = log.NewNull()                              // no output
		if logFilePath != defaultLogFilePath {              // optionally log-file is used for output
			logger = log.NewFile(logFilePath)
		}
	default:
		return fmt.Errorf("unknown source: %s", source)
	}

	// Generate messages
	messageChan := make(chan csp.Message, 10)
	go generator.Generate(messageChan)

	// Game state
	session = game.NewSession()

	// Http server
	go doServe(int64(cc.Int(flagHttpPort)))

	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()

	speaker.Say(locale.Comment("launch"), 1)

	ticker := time.NewTicker(10 * time.Millisecond)
	for {
		select {
		case message := <-messageChan:
			handleCombatMessage(message)
		case message := <-wsInCh:
			handleSocketMessage(message)
		case <-ticker.C:
			handleTicker()
		}
	}

}

func handleTicker() {
	if !lastHitTime.IsZero() && time.Since(lastHitTime) > 200*time.Millisecond { // unclaimed hit
		sayHit(session.Victim, nil)
		session.Victim = nil
		lastHitTime = time.Time{}
	}
}
