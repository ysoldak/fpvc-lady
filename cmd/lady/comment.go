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

var g game.Game

func commentAction(cc *cli.Context) (err error) {

	// TTS
	speak := cc.String(flagSpeak)
	speaker := tts.NewByName(speak)

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


	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()

	speaker.Say("The lady is ready.", 1)

	for message := range messageChan {

		if !g.IsActive() {
			continue
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
				phrase := fmt.Sprintf("%s was hit.", strings.TrimSpace(g.Victim.Name))
				speaker.Say(phrase, 100)
				if cc.Bool(flagSpeakLives) {
					speaker.Say(fmt.Sprintf(" %d lives left.", g.Victim.Lives), 3)
				}
				if cc.Bool(flagSpeakCheers) {
					speaker.Say(hitCheers[rand.Intn(len(hitCheers))], 3)
				}
			}
			if message.IsResponse() {
				event := csp.NewHitResponseFromMessage(&message)
				if g.HitResponse(event) {
					attacker, _ := g.Player(event.ID)
					speaker.Say(fmt.Sprintf("Score to %s.", strings.TrimSpace(attacker.Name)), 5)
					if cc.Bool(flagSpeakCheers) {
						speaker.Say(scoreCheers[rand.Intn(len(scoreCheers))], 3)
					}
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

	speaker.Flush()

	fmt.Println("That's all, folks.")

	return nil
}
