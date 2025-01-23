package main

import (
	"github.com/urfave/cli/v2"
)

const (
	flagSource = "source" // serial, file, demo

	flagSerialPort = "serial-port" // serial port name

	flagHttpPort = "http-port" // http port number

	flagLogFile = "log-file" // log file path
	flagLogFrom = "log-from" // log from datetime: YYYY/MM/DD HH:mm:SS.SSSSSS

	flagLogSocket = "log-socket" // log socket messages

	flagDemoSpeed = "demo-speed" // avg events per minute

	flagLocale = "locale"

	flagSpeakCommand = "speak"
	flagSpeakLives   = "speak-lives"
	flagSpeakCheers  = "speak-cheers"

	flagScoreHit    = "score-hit"
	flagScoreDamage = "score-damage"

	flagAutoStart = "auto-start"

	flagDurationBattle    = "duration-battle"
	flagDurationCountdown = "duration-countdown"
)

const (
	defaultLogFilePath = "fpvc-lady.log"
)

func getFlags() []cli.Flag {
	return []cli.Flag{
		&cli.StringFlag{
			Name:     flagSource,
			Usage:    "Source of CSP messages: serial, log, demo.",
			Required: false,
			Value:    "serial",
		},
		&cli.StringFlag{
			Name:     flagSerialPort,
			Usage:    "Port name where HC12 is connected to; by default the system will try find the port automatically.",
			Required: false,
			Value:    "auto",
		},
		&cli.IntFlag{
			Name:  flagHttpPort,
			Usage: "HTTP server port number",
			Value: 8080,
		},
		&cli.StringFlag{
			Name:     flagLogFile,
			Usage:    "Path to the log file: save events to (when --source=serial) or read events from (when --source=log).",
			Required: false,
			Value:    defaultLogFilePath,
		},
		&cli.StringFlag{
			Name:     flagLogSocket,
			Usage:    "File path to log web socket communication.",
			Required: false,
			Value:    "",
		},
		&cli.StringFlag{
			Name:     flagLogFrom,
			Usage:    "Datetime to start read events from. Format: YYYY/MM/DD[ HH:mm:SS[.SSSSSS]]",
			Required: false,
			Value:    "",
		},
		&cli.IntFlag{
			Name:  flagDemoSpeed,
			Usage: "Number of hits, in average, per minute",
			Value: 10, // 10 is good speed for demo to end soon and all phrases to be spoken; 20 simulates very intence combat, speaker may have to drop phrases
		},
		&cli.StringFlag{
			Name:     flagLocale,
			Usage:    "Locale to use: de, en, ru, etc.",
			Required: false,
			Value:    "en",
		},
		&cli.StringFlag{
			Name:     flagSpeakCommand,
			Usage:    "Text-to-speech command: system, google, none or any other command to convert text to speech.",
			Required: false,
			Value:    "system",
		},
		&cli.BoolFlag{
			Name:     flagSpeakLives,
			Usage:    "Speak lives.",
			Required: false,
			Value:    false,
		},
		&cli.BoolFlag{
			Name:     flagSpeakCheers,
			Usage:    "Speak cheers.",
			Required: false,
			Value:    false,
		},
		&cli.StringFlag{
			Name:     flagScoreHit,
			Usage:    "How much a hit is worth. Fomat: [minID[-maxID]:]score,...",
			Required: false,
			Value:    "A1-E9:3,F1-FF:1", // A-E are players, F is a static target
		},
		&cli.StringFlag{
			Name:     flagScoreDamage,
			Usage:    "How much damage costs you. Fomat: [minID[-maxID]:]score,...",
			Required: false,
			Value:    "-1",
		},
		&cli.BoolFlag{
			Name:     flagAutoStart,
			Usage:    "Start the battle automatically upon first hit.",
			Required: false,
			Value:    true,
		},
		&cli.IntFlag{
			Name:  flagDurationBattle,
			Usage: "Duration of the battle phase, minutes; 0 means no limit",
			Value: 0,
		},
		&cli.IntFlag{
			Name:  flagDurationCountdown,
			Usage: "Duration of the countdown phase, seconds; 0 means no countdown",
			Value: 0,
		},
	}
}
