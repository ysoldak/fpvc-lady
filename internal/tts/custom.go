package tts

import (
	"log"
	"os/exec"
)

type Custom struct {
	executable string
	parameters []string
}

func (tts *Custom) Speak(phrase string) {
	args := append(tts.parameters, phrase)
	cmd := exec.Command(tts.executable, args...)
	if err := cmd.Run(); err != nil {
		log.Fatal(err)
	}
}
