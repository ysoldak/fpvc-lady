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

	flagDemoSpeed = "demo-speed" // avg events per minute

	flagLocale = "locale"

	flagSpeak       = "speak"
	flagSpeakLives  = "speak-lives"
	flagSpeakCheers = "speak-cheers"
)

const (
	defaultLogFilePath = "fpvc-lady.log"
)

func getFlags() []cli.Flag {
	return []cli.Flag{
		&cli.StringFlag{
			Name:     flagSource,
			Usage:    "Source of CSP messages: serial, log, demo.",
			EnvVars:  []string{"SOURCE"},
			Required: false,
			Value:    "serial",
		},
		&cli.StringFlag{
			Name:     flagSerialPort,
			Usage:    "Port name where HC12 is connected to; by default the system will try find the port automatically.",
			EnvVars:  []string{"SERIAL_PORT"},
			Required: false,
			Value:    "auto",
		},
		&cli.IntFlag{
			Name:    flagHttpPort,
			Usage:   "HTTP server port number",
			EnvVars: []string{"HTTP_PORT"},
			Value:   8080,
		},
		&cli.StringFlag{
			Name:     flagLogFile,
			Usage:    "Path to the log file: save events to (--source serial) or read events from (--source log).",
			EnvVars:  []string{"LOG_FILE"},
			Required: false,
			Value:    defaultLogFilePath,
		},
		&cli.StringFlag{
			Name:     flagLogFrom,
			Usage:    "Datetime to start read events from. Format: YYYY/MM/DD[ HH:mm:SS[.SSSSSS]]",
			EnvVars:  []string{"LOG_FROM"},
			Required: false,
			Value:    "",
		},
		&cli.IntFlag{
			Name:    flagDemoSpeed,
			Usage:   "Number of hits, in average, per minute",
			EnvVars: []string{"DEMO_SPEED"},
			Value:   10, // 10 is good speed for demo to end soon and all phrases to be spoken; 20 simulates very intence combat, speaker may have to drop phrases
		},
		&cli.StringFlag{
			Name:     flagLocale,
			Usage:    "Locale to use: de, en, ru, etc.",
			Required: false,
			Value:    "en",
		},
		&cli.StringFlag{
			Name:     flagSpeak,
			Usage:    "Text-to-speech command: system, google, none or any other command to convert text to speech.",
			EnvVars:  []string{"SPEAK"},
			Required: false,
			Value:    "system",
		},
		&cli.BoolFlag{
			Name:     flagSpeakLives,
			Usage:    "Speak lives.",
			EnvVars:  []string{"SPEAK_LIVES"},
			Required: false,
			Value:    false,
		},
		&cli.BoolFlag{
			Name:     flagSpeakCheers,
			Usage:    "Speak cheers.",
			EnvVars:  []string{"SPEAK_CHEERS"},
			Required: false,
			Value:    false,
		},
	}
}
