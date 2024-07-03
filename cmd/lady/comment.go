package main

import (
	"fmt"
	"io"
	"os"

	"github.com/urfave/cli/v2"
	"github.com/ysoldak/fpvc-lady/internal/csp"
	"github.com/ysoldak/fpvc-lady/internal/game"
	"github.com/ysoldak/fpvc-lady/internal/tts"
	"github.com/ysoldak/fpvc-lady/internal/utils"
)

func commentAction(cc *cli.Context) (err error) {

	// TTS
	speech := cc.String(flagSpeech)
	speakerChan := make(chan string, 100)
	ttsEngine := tts.NewByName(speech, speakerChan)
	go ttsEngine.Run()

	// Serial
	serial := io.ReadWriter(os.Stdin)
	port := cc.String(flagPort)
	if port != "none" {
		serial, err = utils.NewSerial(port)
		if err != nil {
			return err
		}
	}

	// CSP
	eventsChan := make(chan interface{}, 100)
	cspEngine := csp.New(serial, eventsChan)
	go cspEngine.Run()

	// Game
	g := game.NewGame()

	// Main loop
	speakerChan <- "Lady is ready."
	for {
		event := <-eventsChan
		switch event := event.(type) {
		case csp.Hit:
			g.Hit(event)
			println("Hit: ", event.PlayerID, event.Lives)
		case csp.Claim:
			victim, ok := g.Claim(event)
			if !ok {
				continue
			}
			attacker := g.Players[event.PlayerID]
			speakerChan <- fmt.Sprintf("%s was hit by %s. %d lives left.", victim.Name, attacker.Name, victim.Lives)
			println("Claim: ", event.PlayerID, event.Power)
		}
	}
}
