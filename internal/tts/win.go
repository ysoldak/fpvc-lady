package tts

import (
	"fmt"
	"log"
	"os/exec"
	"strings"
)

type Windows struct {
}

func (tts *Windows) Speak(phrase string) {
	// PowerShell interprets special characters as parts of commands, so we have to escape them before executing
	replacer := strings.NewReplacer("'", "''", "’", "'’")
	formattedPhrase := replacer.Replace(phrase)

	command := fmt.Sprintf("Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('%s');", formattedPhrase)
	_, err := exec.Command("powershell", "-NoProfile", command).CombinedOutput()
	if err != nil {
		log.Fatal(err)
	}
}
