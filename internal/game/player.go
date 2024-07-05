package game

import "time"

type Player struct {
	ID          byte
	Name        string
	Description string
	Value       byte
	Lives       byte
	Kills       byte
	Deaths      byte
	Updated     time.Time
}
