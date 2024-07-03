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
			Usage:    "Port name",
			EnvVars:  []string{"PORT"},
			Required: false,
			Value:    "",
		},
		&cli.StringFlag{
			Name:     flagSpeech,
			Usage:    "Speech",
			EnvVars:  []string{"SPEECH"},
			Required: false,
			Value:    "system",
		},
	}
}
