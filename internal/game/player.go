package game

import "time"

type Player struct {
	ID          byte
	Name        string
	Description string
	Value       byte
	Lives       byte
	Hits        byte
	Damage      byte
	Updated     time.Time
}
