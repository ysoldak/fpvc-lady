package main

import (
	"fmt"
	"strings"
	"time"

	"math/rand"

	"github.com/urfave/cli/v2"
	"github.com/ysoldak/fpvc-lady/internal/game"
	"github.com/ysoldak/fpvc-lady/internal/generate"
	"github.com/ysoldak/fpvc-lady/internal/log"
	"github.com/ysoldak/fpvc-lady/internal/tts"
	"github.com/ysoldak/fpvc-lady/internal/utils"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

var g game.Game
var logger log.Logger
var speaker *tts.Tts
var lastHitTime = time.Time{}

var config Config = Config{}

func commentAction(cc *cli.Context) (err error) {

	// Init config
	config.InitFromContext(cc)

	// TTS
	speak := cc.String(flagSpeak)
	speaker = tts.NewByName(speak)

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
	g = game.NewGame()

	go doServe(int64(cc.Int(flagHttpPort)))

	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()

	speaker.Say("The lady is ready.", 1)

	ticker := time.NewTicker(10 * time.Millisecond)
	for {
		select {
		case message := <-messageChan:
			handleCombatMessage(message)
		case message := <-wsInCh:
			handleWebSocketMessage(message)
		case <-ticker.C:
			handleTicker()
		}
	}

}

func handleCombatMessage(message csp.Message) {
	if !g.IsActive() {
		return // just drop any message when game is not active
	}

	if len(g.Players) == 0 {
		logger.LogString("") // just an empty line to separate individual sessions visually in the log
	}

	logger.LogMessage(message)

	switch message.Command {
	case csp.CommandBeacon:
		event := csp.NewBeaconFromMessage(&message)
		player, new := g.Beacon(event)
		if new {
			speaker.Say(fmt.Sprintf("%s registered.", strings.TrimSpace(player.Name)), 5)
		}
	case csp.CommandHit:
		if message.IsRequest() {
			event := csp.NewHitRequestFromMessage(&message)
			g.HitRequest(event)
			lastHitTime = time.Now()
		}
		if message.IsResponse() {
			event := csp.NewHitResponseFromMessage(&message)
			if victim := g.HitResponse(event); victim != nil {
				attacker, _ := g.Player(event.ID)
				sayHit(victim, attacker)
				lastHitTime = time.Time{}
			}
		}
	}

	fmt.Println()
	fmt.Println()
	fmt.Println()
	for _, line := range g.Table() {
		fmt.Println(line)
	}
}

func handleTicker() {
	if !lastHitTime.IsZero() && time.Since(lastHitTime) > 200*time.Millisecond { // unclaimed hit
		sayHit(g.Victim, nil)
		g.Victim = nil
		lastHitTime = time.Time{}
	}
}

func sayHit(victim, attacker *game.Player) {
	phrase := fmt.Sprintf("%s hit", strings.TrimSpace(victim.Name))
	if attacker != nil {
		phrase += fmt.Sprintf(" by %s.", strings.TrimSpace(attacker.Name))
	} else {
		phrase += "."
	}
	speaker.Say(phrase, 100)
	if config.SpeakLives {
		speaker.Say(fmt.Sprintf("%d lives left.", victim.Lives), 4)
	}
	if config.SpeakCheers {
		speaker.Say(hitCheers[rand.Intn(len(hitCheers))], 3)
	}
}

func handleWebSocketMessage(message string) {
	switch message {
	case "table":
		response := ""
		for _, line := range g.Table() {
			response += fmt.Sprintln(line)
		}
		wsOutCh <- response
	case "start":
		g.Start()
	case "stop":
		g.Stop()
	default:
		println("Unknown websocket message:", message)
	}
}
