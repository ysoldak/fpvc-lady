package main

import "github.com/urfave/cli/v2"

type Config struct {
	SpeakLives  bool
	SpeakCheers bool
}

func (c *Config) InitFromContext(cc *cli.Context) {
	c.SpeakCheers = cc.Bool(flagSpeakCheers)
	c.SpeakLives = cc.Bool(flagSpeakLives)
}
