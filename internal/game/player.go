package game

import "time"

type Player struct {
	ID          byte      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Lives       byte      `json:"lives"`
	Hits        byte      `json:"hits"`
	Damage      byte      `json:"damage"`
	Joined      time.Time `json:"-"` // needed for score calculation (the one who joined earlier ranked higher when scores are equal)
	Updated     time.Time `json:"updated"`
	Score       int       `json:"score"`
}
