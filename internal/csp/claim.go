package csp

type Claim struct {
	PlayerID byte
	Power    byte
}

func NewClaim(data []byte) Claim {
	return Claim{
		PlayerID: data[0],
		Power:    data[1],
	}
}
