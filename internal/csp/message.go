package csp

type Message struct {
	header   [2]byte // '$' + 'C'
	length   byte    // Length of the data
	command  byte    // 0x82 = Claim, 0x83 = Hit
	data     []byte  // Data
	checksum byte    // XOR of all bytes from length to the end of data
}
