package main

import (
	"strings"
	"time"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

func handleCombatMessage(message csp.Message) {
	if !session.IsActive() {
		return // just drop any message when game is not active
	}

	if len(session.Players) == 0 {
		logger.LogString("") // just an empty line to separate individual sessions visually in the log
	}

	logger.LogMessage(message)

	switch message.Command {
	case csp.CommandBeacon:
		event := csp.NewBeaconFromMessage(&message)
		player, new := session.Beacon(event)
		if new {
			joinedPhrase := locale.Comment("joined")
			joinedPhrase = strings.ReplaceAll(joinedPhrase, "{player}", player.Name)
			speaker.Say(joinedPhrase, 5)
		}
	case csp.CommandHit:
		if message.IsRequest() {
			event := csp.NewHitRequestFromMessage(&message)
			session.HitRequest(event)
			lastHitTime = time.Now()
		}
		if message.IsResponse() {
			event := csp.NewHitResponseFromMessage(&message)
			if victim := session.HitResponse(event); victim != nil {
				attacker, _ := session.Player(event.ID)
				sayHit(victim, attacker)
				lastHitTime = time.Time{}
			}
		}
	}

	sendSocket(SocketMessage{Type: SocketMessageTypeSession, Payload: session})

	printTable()
}
