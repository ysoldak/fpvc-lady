package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/gdamore/tcell/v2"
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

var screen tcell.Screen

var lastHitTime = time.Time{} // time of the last (unclaimed) hit

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
	scoreHit, err := ParseScoreConfigs(config.ScoreHit)
	if err != nil {
		panic(err)
	}
	scoreDamage, err := ParseScoreConfigs(config.ScoreDamage)
	if err != nil {
		panic(err)
	}
	session = game.NewSession(scoreHit, scoreDamage)

	// Http server
	go doServe(int64(cc.Int(flagHttpPort)))

	// Main loop
	fmt.Println()
	fmt.Println("The lady is ready.")
	fmt.Println()
	fmt.Println("Listening to combat events...")
	fmt.Println()

	speaker.Say(locale.Comment("launch"), 100)

	speaker.Say(locale.Comment("registration_open"), 100)

	tcell.SetEncodingFallback(tcell.EncodingFallbackASCII)
	screen, err = tcell.NewScreen()
	if err != nil {
		return err
	}
	if err = screen.Init(); err != nil {
		return err
	}

	screen.Clear()
	printTable()

	quit := make(chan struct{})
	go func() {
		for {
			ev := screen.PollEvent()
			switch ev := ev.(type) {
			case *tcell.EventKey:
				switch ev.Key() {
				case tcell.KeyRune:
					switch {
					case ev.Rune() == ' ': // advance session
						session.Advance()
						sendSocket(SocketMessage{Type: SocketMessageTypeSession, Payload: session})
					case ev.Rune() == 'r' || ev.Rune() == 'R': // restart session
						if session.IsEnded() {
							session.Timestamps = game.SessionTimestamps{
								RegStarted: time.Now(),
								RegEnded:   time.Time{},
								BatStarted: time.Time{},
								BatEnded:   time.Time{},
							}
						}
					case ev.Rune() == 'x' || ev.Rune() == 'X':
						screen.Clear()
						showConfigLines = !showConfigLines
					case ev.Rune() == 'c' || ev.Rune() == 'C':
						config.SpeakCheers = !config.SpeakCheers
					case ev.Rune() == 'l' || ev.Rune() == 'L':
						config.SpeakLives = !config.SpeakLives
					case ev.Rune() == 'q' || ev.Rune() == 'Q':
						close(quit)
						return
					}
					printTable()
				case tcell.KeyCtrlC, tcell.KeyEscape:
					close(quit)
					return
				}
			case *tcell.EventResize:
				screen.Sync()
			}
		}
	}()

	every10ms := time.NewTicker(10 * time.Millisecond)
	every1s := time.NewTicker(1 * time.Second)
loop:
	for {
		select {
		case message := <-messageChan:
			handleCombatMessage(message)
		case message := <-wsInCh:
			handleSocketMessage(message)
		case <-every10ms.C:
			handleUnclaimedHit()
		case <-every1s.C:
			handleEverySecond()
		case <-quit:
			screen.Fini()
			break loop
		}
	}

	dumpTable()

	fmt.Println()
	fmt.Println("That's all, folks!")

	return nil
}

func handleUnclaimedHit() {
	if !lastHitTime.IsZero() && time.Since(lastHitTime) > 200*time.Millisecond { // unclaimed hit
		session.UpdateScores()
		sayHit(session.Victim, nil)
		session.Victim = nil
		lastHitTime = time.Time{}
	}
}

var countingDown bool

func handleEverySecond() {

	if session.IsRegistration() && time.Since(session.Timestamps.RegStarted) < 1*time.Second {
		session.Reset()
		screen.Clear()
		speaker.Say(locale.Comment("registration_open"), 100)
	}

	// Return fast if session is ended
	if session.IsEnded() {
		if time.Since(session.Timestamps.BatEnded) < 1*time.Second {
			speaker.Say(locale.Comment("battle_end"), 100)
		}
		return
	}

	if session.IsBattle() && time.Since(session.Timestamps.BatStarted) < 1*time.Second && len(session.Hits) == 0 { // battle just started and no hits yet, if it was auto-started, then we already have spoken the start
		speaker.Say(locale.Comment("battle_start"), 100)
	}

	if session.IsCountdown() && !countingDown {
		countingDown = true
		go func() {
			if config.DurationCountdown > 0 {
				speaker.Say(locale.Comment("battle_countdown"), 100)
				for i := config.DurationCountdown; i > 0 && !session.IsBattle(); i-- { // countdown may be force-cancelled if battle start set from outside (ws or space press)
					speaker.Say(fmt.Sprintf("%d.", i), 100)
					time.Sleep(1 * time.Second)
				}
			}
			if !session.IsBattle() {
				session.Advance()
			}
			countingDown = false
		}()
	}

	// Handle battle of limited duration
	if config.DurationBattle > 0 && session.IsBattle() {
		sinceBattleStart := time.Since(session.Timestamps.BatStarted)
		battleDuration := time.Duration(config.DurationBattle) * time.Minute
		if sinceBattleStart > battleDuration { // battle is over
			session.Advance()
		} else {
			durationLeft := battleDuration - sinceBattleStart
			if 0 < durationLeft && durationLeft <= 10*time.Second { // last 10 seconds
				speaker.Say(fmt.Sprintf("%d.", int(durationLeft.Seconds())), 1)
			} else { // every minute
				if int(sinceBattleStart.Seconds())%60 == 0 {
					timeLeft := config.DurationBattle - int(sinceBattleStart.Minutes())
					timeLeftStr := fmt.Sprintf("%d", timeLeft)
					phrase := strings.Replace(locale.Comment("battle_minutes"), "{minutes}", timeLeftStr, 1)
					speaker.Say(phrase, 1)
				}
			}
		}
	}

	// Refresh screen
	printTable()
}
