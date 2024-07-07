package main

import (
	"github.com/urfave/cli/v2"
)

const (
	flagPort   = "port"
	flagSpeech = "speech"
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
			Name:     flagSpeech,
			Usage:    "Speech command: [system], google, none or any other command to convert text to speech.",
			EnvVars:  []string{"SPEECH"},
			Required: false,
			Value:    "system",
		},
	}
}
