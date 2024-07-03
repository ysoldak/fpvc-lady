package csp

type Hit struct {
	PlayerID byte
	Lives    byte
}

func NewHit(data []byte) Hit {
	return Hit{
		PlayerID: data[0],
		Lives:    data[1],
	}
}
