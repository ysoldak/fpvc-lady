package game

import "time"

type Player struct {
	ID          byte      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Lives       byte      `json:"lives"`
	Hits        byte      `json:"hits"`
	Damage      byte      `json:"damage"`
	Updated     time.Time `json:"updated"`
}
