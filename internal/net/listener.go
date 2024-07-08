package net

import (
	"io"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Listener struct {
	adapter  *csp.Adapter
	messages chan csp.Message
}

func NewListener(wire io.ReadWriter, messages chan csp.Message) *Listener {
	return &Listener{
		adapter:  csp.NewAdapter(wire),
		messages: messages,
	}
}

func (l *Listener) Run() {
	// csp.Logger = os.Stdout
	go func() {
		for {
			message, _ := l.adapter.Receive()
			if message == nil {
				continue
			}
			l.messages <- *message
		}
	}()
}
