package generate

import (
	"io"
	"time"

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
	message := &csp.Message{} // placeholder for the message to be received
	for {
		err := l.adapter.Receive(message)

		// No data available, continue to wait for the next message
		if err == csp.ErrNoData {
			time.Sleep(100 * time.Millisecond)
			continue
		}

		// Ignore all other errors
		if err != nil {
			continue
		}

		output <- *message
	}
}
