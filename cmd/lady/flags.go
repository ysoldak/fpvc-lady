package main

import (
	"github.com/urfave/cli/v2"
)

const (
	flagPort        = "port"
	flagSpeak       = "speak"
	flagSpeakLives  = "speak-lives"
	flagSpeakCheers = "speak-cheers"
)

func getFlags() []cli.Flag {
	return []cli.Flag{
		&cli.StringFlag{
			Name:     flagPort,
			Usage:    "Port name where HC12 is connected to.",
			EnvVars:  []string{"PORT"},
			Required: false,
			Value:    "auto",
		},
		&cli.StringFlag{
			Name:     flagSpeak,
			Usage:    "Text-to-speech command: [system], google, none or any other command to convert text to speech.",
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
