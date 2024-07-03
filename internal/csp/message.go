package csp

type Message struct {
	header   [2]byte
	length   byte
	command  byte
	data     []byte
	checksum byte
}
