package main

import (
	"encoding/json"

	"github.com/urfave/cli/v2"
)

type Config struct {
	Source       string `json:"-"`
	LogSocket    string `json:"logSocket"`
	Locale       string `json:"locale"`
	SpeakCommand string `json:"speakCommand"`
	SpeakLives   bool   `json:"speakLives"`
	SpeakCheers  bool   `json:"speakCheers"`
	ScoreHit     string `json:"scoreHits"`
	ScoreDamage  string `json:"scoreDamages"`
}

func NewConfigFromContext(cc *cli.Context) (config Config) {
	return Config{
		Source:       cc.String(flagSource),
		LogSocket:    cc.String(flagLogSocket),
		Locale:       cc.String(flagLocale),
		SpeakCommand: cc.String(flagSpeakCommand),
		SpeakCheers:  cc.Bool(flagSpeakCheers),
		SpeakLives:   cc.Bool(flagSpeakLives),
		ScoreHit:     cc.String(flagScoreHit),
		ScoreDamage:  cc.String(flagScoreDamage),
	}
}

func NewConfigFromMap(m map[string]interface{}) (config Config, err error) {
	bytes, err := json.Marshal(m)
	if err != nil {
		return
	}
	config, err = NewConfigFromJSON(bytes)
	return
}

func NewConfigFromJSON(data []byte) (config Config, err error) {
	err = json.Unmarshal(data, &config)
	return
}

func (c Config) ToJSON() (data []byte, err error) {
	data, err = json.Marshal(c)
	return
}
