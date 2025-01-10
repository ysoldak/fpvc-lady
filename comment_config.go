package main

import "github.com/ysoldak/fpvc-lady/internal/tts"

func applyConfig(newConfig Config) {
	config = newConfig
	locale = NewLocale(config.Locale)
	speaker.Flush()
	speaker = tts.NewByName(config.SpeakCommand, config.Locale)
}
