package main

import (
	"fmt"
	"strings"

	"math/rand"

	"github.com/urfave/cli/v2"
	"github.com/ysoldak/fpvc-lady/internal/game"
	"github.com/ysoldak/fpvc-lady/internal/generate"
	"github.com/ysoldak/fpvc-lady/internal/log"
	"github.com/ysoldak/fpvc-lady/internal/tts"
	"github.com/ysoldak/fpvc-lady/internal/utils"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

func commentAction(cc *cli.Context) (err error) {

	// TTS
	speech := cc.String(flagSpeak)
	speakerChan := make(chan string, 100)
	ttsEngine := tts.NewByName(speech, speakerChan)
	go ttsEngine.Run()

	// Source & Log
	var generator generate.Generator
	var logger log.Logger
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
		generator = generate.NewDemo() // stream of fake messages is used for input
		logger = log.NewNull()         // no output
		// logger = log.NewFile(logFilePath) // log-file is used for output
	default:
		return fmt.Errorf("unknown source: %s", source)
	}

	// Generate messages
	messageChan := make(chan csp.Message, 10)
	go generator.Generate(messageChan)

	// Game state
	g := game.NewGame()

	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()

	speakerChan <- "The lady is ready."

	logger.LogString("") // just an empty line to separate individual sessions visually in the log

	for message := range messageChan {

		logger.LogMessage(message)

		switch message.Command {
		case csp.CommandBeacon:
			event := csp.NewBeaconFromMessage(&message)
			player, new := g.Beacon(event)
			if new {
				speakerChan <- fmt.Sprintf("%s registered.", strings.TrimSpace(player.Name))
			}
		case csp.CommandHit:
			if message.IsRequest() {
				event := csp.NewHitRequestFromMessage(&message)
				g.HitRequest(event)
				phrase := fmt.Sprintf("%s was hit.", strings.TrimSpace(g.Victim.Name))
				if cc.Bool(flagSpeakLives) {
					phrase += fmt.Sprintf(" %d lives left.", g.Victim.Lives)
				}
				if cc.Bool(flagSpeakCheers) {
					phrase += " " + hitCheers[rand.Intn(len(hitCheers))]
				}
				speakerChan <- phrase
			}
			if message.IsResponse() {
				event := csp.NewHitResponseFromMessage(&message)
				if g.HitResponse(event) {
					attacker, _ := g.Player(event.ID)
					speakerChan <- fmt.Sprintf("Score to %s.", strings.TrimSpace(attacker.Name))
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

	fmt.Println("That's all, folks.")

	return nil
}
