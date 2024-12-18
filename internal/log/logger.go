package log

import csp "github.com/ysoldak/fpvc-serial-protocol"

type Logger interface {
	LogMessage(message csp.Message)
	LogString(line string)
}
