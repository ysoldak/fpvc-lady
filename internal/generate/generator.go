package generate

import csp "github.com/ysoldak/fpvc-serial-protocol"

// Generator is an interface for message generators.
// Implementations of this interface should generate messages and send them to the provided channel.
// The generator should close the channel when it finishes.
type Generator interface {
	Generate(messages chan csp.Message)
}
