package main

import "github.com/urfave/cli/v2"

type Config struct {
	Locale      string
	SpeakLives  bool
	SpeakCheers bool
}

func (c *Config) InitFromContext(cc *cli.Context) {
	c.Locale = cc.String(flagLocale)
	c.SpeakCheers = cc.Bool(flagSpeakCheers)
	c.SpeakLives = cc.Bool(flagSpeakLives)
}
