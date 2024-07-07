package main

import (
	"fmt"
	"io"
	"os"
	"time"

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

	// Temporary for testing
	if port == "none" {
		go func() {
			for {
				time.Sleep(5 * time.Second)
				eventsChan <- csp.Hit{
					PlayerID: 0xA1,
					Lives:    10,
				}
				time.Sleep(100 * time.Millisecond)
				eventsChan <- csp.Claim{
					PlayerID: 0xB1,
					Power:    3,
				}
			}
		}()
	}

	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()
	speakerChan <- "The lady is ready."
	for {
		event := <-eventsChan
		switch event := event.(type) {
		case csp.Beacon:
			player, new := g.Beacon(event)
			if new {
				speakerChan <- fmt.Sprintf("%s registered", player.Name)
			}
			// fmt.Printf("%v Beacon: %X %s %s\n", time.Now(), event.PlayerID, event.Name, event.Description)
		case csp.Hit:
			g.Hit(event)
			// println("Hit: ", event.PlayerID, event.Lives)
		case csp.Claim:
			victim, ok := g.Claim(event)
			if !ok {
				continue
			}
			attacker, _ := g.Player(event.PlayerID)
			speakerChan <- fmt.Sprintf("%s was hit by %s. %d lives left.", victim.Name, attacker.Name, victim.Lives)
			// println("Claim: ", event.PlayerID, event.Power)
		}
		println()
		println()
		println()
		for _, line := range g.Table() {
			println(line)
		}
	}
}
