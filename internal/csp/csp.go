package csp

import "io"

const (
	COMMAND_HIT   byte = 0x82
	COMMAND_CLAIM byte = 0x84
)

const (
	// States
	STATE_IDLE byte = iota
	STATE_HEADER
	STATE_LENGTH
	STATE_COMMAND
	STATE_DATA
	STATE_CHECKSUM
)

type CSP struct {
	serial io.ReadWriter
	events chan interface{}

	state   byte
	message Message
}

func New(serial io.ReadWriter, events chan interface{}) *CSP {
	return &CSP{
		serial: serial,
		events: events,
	}
}

func (csp *CSP) Run() {
	buf := make([]byte, 1000)
	for {
		n, err := csp.serial.Read(buf)
		if err != nil {
			panic(err)
		}
		if n == 0 {
			continue
		}
		for i := 0; i < n; i++ {
			b := buf[i]
			switch csp.state {
			case STATE_IDLE:
				if b == '$' {
					csp.message.header[0] = b
					csp.state = STATE_HEADER
				}
			case STATE_HEADER:
				if b == 'C' {
					csp.message.header[1] = b
					csp.state = STATE_LENGTH
				}
			case STATE_LENGTH:
				csp.message.length = b
				csp.message.checksum = b
				csp.state = STATE_COMMAND
			case STATE_COMMAND:
				csp.message.command = b
				csp.message.checksum ^= b
				csp.state = STATE_DATA
			case STATE_DATA:
				csp.message.data = append(csp.message.data, b)
				csp.message.checksum ^= b
				if len(csp.message.data) == int(csp.message.length) {
					csp.state = STATE_CHECKSUM
				}
			case STATE_CHECKSUM:
				if csp.message.checksum == b {
					csp.emitEvent()
				}
				csp.message = Message{}
				csp.state = STATE_IDLE
			}
		}
	}
}

func (csp *CSP) emitEvent() {
	switch csp.message.command {
	case COMMAND_HIT:
		csp.events <- NewHit(csp.message.data)
	case COMMAND_CLAIM:
		csp.events <- NewClaim(csp.message.data)
	}
}
