package tts

import "strings"

const (
	BackendNone   = "none"
	BackendGoogle = "google"
	BackendSystem = "system"
)

type TtsBackend interface {
	Speak(phrase string)
}

type Tts struct {
	backend TtsBackend
	phrases chan string
}

func New(backend TtsBackend, phrases chan string) *Tts {
	return &Tts{
		backend: backend,
		phrases: phrases,
	}
}

func NewByName(backendName string, phrases chan string) *Tts {
	var backend TtsBackend
	switch backendName {
	case BackendNone:
		backend = &None{}
	case BackendGoogle:
		backend = NewGoogle()
	case BackendSystem:
		backend = NewSystem()
	default:
		exec := backendName
		params := []string{}
		if strings.Contains(exec, " ") {
			parts := strings.Split(exec, " ")
			exec = parts[0]
			params = parts[1:]
		}
		backend = &Custom{executable: exec, parameters: params}
	}
	return New(backend, phrases)
}

func (tts *Tts) Run() {
	for phrase := range tts.phrases {
		tts.backend.Speak(phrase)
	}
}
