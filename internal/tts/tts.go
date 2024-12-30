package tts

import (
	"strings"
	"time"
)

const (
	BackendNone   = "none"
	BackendGoogle = "google"
	BackendSystem = "system"
)

type TtsBackend interface {
	Speak(phrase string)
}

type phrase struct {
	text string
	prio int
}

type Tts struct {
	backend TtsBackend
	phrases chan phrase
	buffer  []phrase
	flush   bool
}

func New(backend TtsBackend) *Tts {
	tts := Tts{
		backend: backend,
		phrases: make(chan phrase, 100),
		buffer:  []phrase{},
		flush:   false,
	}
	go tts.run()
	return &tts
}

func NewByName(backendName string) *Tts {
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
	return New(backend)
}

func (tts *Tts) Say(text string, prio int) {
	if tts.flush {
		return
	}
	tts.phrases <- phrase{text, prio}
}

// Flush speaker by blocking until phrase buffer is empty. This also stops speaker routine, so speaker can't be reused.
func (tts *Tts) Flush() {
	tts.flush = true
	for tts.flush {
		time.Sleep(100 * time.Millisecond)
	}
}

func (tts *Tts) run() {
	ticker := time.NewTicker(100 * time.Millisecond)
	for {
		select {
		case phrase := <-tts.phrases:
			tts.buffer = append(tts.buffer, phrase)
		case <-ticker.C:
			if len(tts.buffer) == 0 && tts.flush {
				tts.flush = false
				return
			}
			if len(tts.buffer) > 0 {
				tts.processBuffer()
			}
		}
	}
}

func (tts *Tts) processBuffer() {

	// evict low priority phrases (prio < buffer length) one by one until none can be evicted anymore
	for {
		evicted := false
		for i, p := range tts.buffer {
			if p.prio < len(tts.buffer) {
				// println("-", p.prio, len(tts.buffer), p.text)
				tts.buffer = append(tts.buffer[:i], tts.buffer[i+1:]...)
				evicted = true
				break
			}
		}
		if !evicted {
			break
		}
	}

	// return fast if nothing left
	if len(tts.buffer) == 0 {
		return
	}

	// construct long phrase and send it to our speech backend
	longPhrase := ""
	for _, phrase := range tts.buffer {
		longPhrase += phrase.text + " "
	}
	tts.backend.Speak(longPhrase)

	// following emulates speech delay, for debugging
	// println(time.Now().Format("15:04:05.000000"), ">", longPhrase)
	// time.Sleep(time.Second)
	// time.Sleep(time.Duration(len(longPhrase)) * 100 * time.Millisecond)

	// empty buffer
	tts.buffer = tts.buffer[0:0]
}
