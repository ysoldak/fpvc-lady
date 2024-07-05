package csp

type Beacon struct {
	PlayerID    byte
	Name        string
	Description string
}

func NewBeacon(data []byte) Beacon {
	return Beacon{
		PlayerID:    data[0],
		Name:        string(data[1:11]),
		Description: string(data[11:31]),
	}
}
