package csp

import (
	"io"
)

// Commands
const (
	COMMAND_BEACON byte = 0x71

	COMMAND_HIT   byte = 0x82
	COMMAND_CLAIM byte = 0x84
)

// States
const (
	STATE_IDLE byte = iota
	STATE_HEADER
	STATE_LENGTH
	STATE_COMMAND
	STATE_PAYLOAD
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
					csp.message.Header[0] = b
					csp.state = STATE_HEADER
				}
			case STATE_HEADER:
				if b == 'C' {
					csp.message.Header[1] = b
					csp.state = STATE_LENGTH
				} else {
					csp.message = Message{}
					csp.state = STATE_IDLE
				}
			case STATE_LENGTH:
				if b > MAX_PAYLOAD {
					csp.message = Message{}
					csp.state = STATE_IDLE
					break
				}
				csp.message.Length = b
				csp.message.Checksum = b
				csp.state = STATE_COMMAND
			case STATE_COMMAND:
				csp.message.Command = b
				csp.message.Checksum ^= b
				csp.state = STATE_PAYLOAD
			case STATE_PAYLOAD:
				csp.message.Payload = append(csp.message.Payload, b)
				csp.message.Checksum ^= b
				if len(csp.message.Payload) == int(csp.message.Length) {
					csp.state = STATE_CHECKSUM
				}
			case STATE_CHECKSUM:
				// fmt.Printf("%s ", time.Now().Format("15:04:05.000"))
				// for _, b := range csp.message.Bytes() {
				// 	fmt.Printf("%02X ", b)
				// }
				// fmt.Println()
				if csp.message.Checksum == b {
					csp.emitEvent()
					// } else {
					// 	fmt.Printf("%s %02X %02X checksum error %02X != %02X\n", time.Now().Format("15:04:05.000"), csp.message.Command, csp.message.Length, csp.message.Checksum, b)
				}
				csp.message = Message{}
				csp.state = STATE_IDLE
			}
		}
	}
}

func (csp *CSP) emitEvent() {
	switch csp.message.Command {
	case COMMAND_BEACON:
		csp.events <- NewBeacon(csp.message.Payload)
	case COMMAND_HIT:
		csp.events <- NewHit(csp.message.Payload)
	case COMMAND_CLAIM:
		csp.events <- NewClaim(csp.message.Payload)
	}
}
