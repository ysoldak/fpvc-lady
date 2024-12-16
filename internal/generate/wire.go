package generate

import (
	"io"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Wire struct {
	adapter *csp.Adapter
}

func NewWire(bytes io.ReadWriter) *Wire {
	return &Wire{
		adapter: csp.NewAdapter(bytes),
	}
}

func (l *Wire) Generate(output chan csp.Message) {
	for {
		message, _ := l.adapter.Receive()
		if message == nil {
			continue
		}
		output <- *message
	}
}
