package tts

import "time"

type None struct {
}

func (tts *None) Speak(phrase string) {
	time.Sleep(time.Second)
}
