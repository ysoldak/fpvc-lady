package main

import (
	"fmt"
	"io"
	"strings"
	"time"

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
	var serial io.ReadWriter
	port := cc.String(flagPort)
	if port != "demo" {
		serial, err = utils.NewSerial(port)
		if err != nil {
			return err
		}
	}

	// CSP
	messageChan := make(chan csp.Message, 10)
	if serial != nil {
		listener := net.NewListener(serial, messageChan)
		go listener.Run()
	} else {
		go demo(messageChan)
	}

	// Game
	g := game.NewGame()

	// Trace
	go trace()

	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()

	speakerChan <- "The lady is ready."
	traceChan <- "START"

	for message := range messageChan {

		switch message.Command {
		case csp.CommandBeacon:
			event := csp.NewBeaconFromMessage(&message)
			player, new := g.Beacon(event)
			if new {
				speakerChan <- fmt.Sprintf("%s registered", player.Name)
				traceChan <- fmt.Sprintf("REG %02X %s", player.ID, strings.ReplaceAll(player.Name, " ", "_"))
			}
		case csp.CommandHit:
			if message.IsRequest() {
				event := csp.NewHitRequestFromMessage(&message)
				traceChan <- fmt.Sprintf("HIT %02X %d", event.ID, event.Lives)
				g.HitRequest(event)
				phrase := fmt.Sprintf("%s was hit.", g.Victim.Name)
				if cc.Bool(flagSpeakLives) {
					phrase += fmt.Sprintf(" %d lives left.", g.Victim.Lives)
				}
				speakerChan <- phrase
			}
			if message.IsResponse() {
				event := csp.NewHitResponseFromMessage(&message)
				traceChan <- fmt.Sprintf("CLM %02X %d", event.ID, event.Power)
				if g.HitResponse(event) {
					attacker, _ := g.Player(event.ID)
					speakerChan <- fmt.Sprintf("Score to %s.", attacker.Name)
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

	return nil
}

func demo(messageChan chan csp.Message) {
	a := csp.NewBeacon(0xA1, "ALICE     ", "fake fake fake fake ")
	b := csp.NewBeacon(0xB1, "BARTOLOMEO", "fake fake fake fake ")
	time.Sleep(2 * time.Second)

	messageChan <- *a.Message()
	time.Sleep(1 * time.Second)
	messageChan <- *b.Message()

	time.Sleep(6 * time.Second)

	messageChan <- *a.Message()
	time.Sleep(1 * time.Second)
	messageChan <- *b.Message()

	time.Sleep(5 * time.Second)

	lives := byte(5)
	for {
		messageChan <- *csp.NewHitRequest(0xA1, lives).Message()
		time.Sleep(100 * time.Millisecond)
		messageChan <- *csp.NewHitResponse(0xB1, 3).Message()
		time.Sleep(3 * time.Second)
		lives--
		if lives == 0 {
			break
		}
	}
}
