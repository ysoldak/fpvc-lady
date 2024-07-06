package csp

const MAX_PAYLOAD = 111

type Message struct {
	Header   [2]byte // '$' + 'C'
	Length   byte    // Length of the payload
	Command  byte    // 0x82 = Claim, 0x83 = Hit
	Payload  []byte  // Data
	Checksum byte    // XOR of all bytes from length to the end of data
}

func (m *Message) Bytes() []byte {
	b := make([]byte, 4+len(m.Payload)+1)
	b[0] = m.Header[0]
	b[1] = m.Header[1]
	b[2] = m.Length
	b[3] = m.Command
	copy(b[4:], m.Payload)
	b[len(b)-1] = m.Checksum
	return b
}
