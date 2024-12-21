package log

import csp "github.com/ysoldak/fpvc-serial-protocol"

type Null struct {
}

func NewNull() *Null {
	return &Null{}
}

func (nl *Null) LogMessage(m csp.Message) {
	// Do nothing
}

func (nl *Null) LogString(line string) {
	// Do nothing
}
