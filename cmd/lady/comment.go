package main

import (
	"fmt"
	"io"
	"os"

	"github.com/urfave/cli/v2"
	"github.com/ysoldak/fpvc-lady/internal/game"
	"github.com/ysoldak/fpvc-lady/internal/net"
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
	messageChan := make(chan csp.Message, 10)
	listener := net.NewListener(serial, messageChan)
	go listener.Run()

	// Game
	g := game.NewGame()

	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()
	speakerChan <- "The lady is ready."
	for {
		message := <-messageChan
		switch message.Command {
		case csp.CommandBeacon:
			event := csp.NewBeaconFromMessage(&message)
			player, new := g.Beacon(event)
			if new {
				speakerChan <- fmt.Sprintf("%s registered", player.Name)
			}
		case csp.CommandHit:
			if message.IsRequest() {
				event := csp.NewHitRequestFromMessage(&message)
				g.HitRequest(event)
			}
			if message.IsResponse() {
				event := csp.NewHitResponseFromMessage(&message)
				victim, ok := g.HitResponse(event)
				if !ok {
					continue
				}
				attacker, _ := g.Player(event.ID)
				phrase := fmt.Sprintf("%s was hit by %s.", victim.Name, attacker.Name)
				if cc.Bool(flagSpeakLives) {
					phrase += fmt.Sprintf(" %d lives left.", victim.Lives)
				}
				speakerChan <- phrase
			}
		}
		println()
		println()
		println()
		for _, line := range g.Table() {
			println(line)
		}
	}
}
