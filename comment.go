package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"

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
var lang *Lang

var lastHitTime = time.Time{}

var config Config = Config{}

func commentAction(cc *cli.Context) (err error) {

	// Init config
	config.InitFromContext(cc)

	// Init lang
	lang = NewLang(config.Language)

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

	speaker.Say(lang.Comment("launch"), 1)

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
			joinedPhrase := lang.Comment("joined")
			joinedPhrase = strings.ReplaceAll(joinedPhrase, "{player}", strings.TrimSpace(player.Name))
			speaker.Say(joinedPhrase, 5)
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
	for _, line := range printTable() {
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
	block := tts.PhraseBlock{}

	hitPhrase := lang.Comment("hit")
	hitPhrase = strings.ReplaceAll(hitPhrase, "{victim}", strings.TrimSpace(victim.Name))
	block = append(block, tts.Phrase{Text: hitPhrase, Prio: 100})

	if attacker != nil {
		hitByPhrase := lang.Comment("hit_by")
		hitByPhrase = strings.ReplaceAll(hitByPhrase, "{attacker}", strings.TrimSpace(attacker.Name))
		hitByPhrase = strings.ReplaceAll(hitByPhrase, "{victim}", strings.TrimSpace(victim.Name))
		block = append(block, tts.Phrase{Text: hitByPhrase, Prio: 3})
	}

	if config.SpeakLives {
		livesPhrase := lang.Comment("lives_left")
		livesPhrase = strings.ReplaceAll(livesPhrase, "{lives}", strconv.Itoa(int(victim.Lives)))
		lastPhraseInBlock := block[len(block)-1] // we copy last phrase in the block (can be w/ or w/o attacker) and append "lives left" to it.
		block = append(block, tts.Phrase{Text: lastPhraseInBlock.Text + livesPhrase, Prio: 2})
	}

	speaker.SayBlock(block)

	if config.SpeakCheers {
		speaker.Say(lang.RandomCheer(), 2)
	}
}

func handleWebSocketMessage(message string) {
	switch message {
	case "table":
		response := ""
		for _, line := range printTable() {
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

func printTable() []string {
	table := []string{}
	header := fmt.Sprintf(
		" ID | %-10s | %-20s | %-12s || %10s | %10s | %10s",
		lang.Label("tableName"),
		lang.Label("tableDescription"),
		lang.Label("tableUpdated"),
		lang.Label("tableHits"),
		lang.Label("tableHoles"),
		lang.Label("tableLives"))
	table = append(table, header)

	table = append(table, "--- | ---------- | -------------------- | ------------ || ---------- | ---------- | -----------")
	for _, p := range g.Players {
		updated := p.Updated.Format("15:04:05.000")
		table = append(table, fmt.Sprintf(" %X | %-10s | %-20s | %s || %10d | %10d | %10d", p.ID, printableString(p.Name), printableString(p.Description), updated, p.Kills, p.Deaths, p.Lives))
	}
	return table
}

func printableString(str string) string {
	result := str
	for i := 0; i < len(result); i++ {
		if result[i] < 0x20 || result[i] > 0x7E {
			result = result[:i] + "?" + result[i+1:]
		}
	}
	return result
}
