package game

import (
	"fmt"
	"slices"
	"strings"
	"time"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Hit struct {
	AttackerID *byte     `json:"attackerId"`
	VictimID   *byte     `json:"victimId"`
	Timestamp  time.Time `json:"timestamp"`
}

type IDRange struct {
	Min byte `json:"min"`
	Max byte `json:"max"`
}

type ScoreConfig struct {
	Range IDRange `json:"range"`
	Score int     `json:"score"`
}

type SessionTimestamps struct {
	RegStarted time.Time `json:"regStarted"`
	RegEnded   time.Time `json:"regEnded"`
	BatStarted time.Time `json:"batStarted"`
	BatEnded   time.Time `json:"batEnded"`
}

type Session struct {
	Timestamps SessionTimestamps `json:"timestamps"`
	Players    []*Player         `json:"players"`
	Hits       []Hit             `json:"hits"`

	ScoreHits    []ScoreConfig `json:"-"`
	ScoreDamages []ScoreConfig `json:"-"`
	Victim       *Player       `json:"-"`
}

func NewSession(scoreHits, scoreDamages []ScoreConfig) Session {
	return Session{
		Players:      []*Player{},
		ScoreHits:    scoreHits,
		ScoreDamages: scoreDamages,
		Hits:         []Hit{},
		Timestamps: SessionTimestamps{
			RegStarted: time.Now(),
			RegEnded:   time.Time{},
			BatStarted: time.Time{},
			BatEnded:   time.Time{},
		},
	}
}

func (g *Session) Reset() {
	g.Players = g.Players[0:0]
	g.Victim = nil
	g.Hits = g.Hits[0:0]
}

func (g *Session) Beacon(event *csp.Beacon) (player *Player, new bool) {
	player, new = g.Player(event.ID)
	player.Name = strings.TrimSpace(event.Name)
	player.Description = strings.TrimSpace(event.Description)
	player.Updated = time.Now()
	return
}

func (g *Session) HitRequest(event *csp.HitRequest) {
	victim, _ := g.Player(event.ID)
	victim.Lives = event.Lives - 1
	victim.Damage++
	victim.Updated = time.Now()
	g.Victim = victim
	g.Hits = append(g.Hits, Hit{
		AttackerID: nil,
		VictimID:   &victim.ID,
		Timestamp:  time.Now(),
	})
	// note: can't update scores here, because we don't know who was shooting
}

func (g *Session) HitResponse(event *csp.HitResponse) (victim *Player) {
	attacker, _ := g.Player(event.ID)
	if g.Victim != nil {
		attacker.Hits++
		attacker.Updated = time.Now()
		victim = g.Victim
		g.Hits[len(g.Hits)-1].AttackerID = &attacker.ID
		g.UpdateScores() // update scores, all information is available
		g.Victim = nil
		return victim
	}
	return nil
}

// UpdateScores adjusts scores for last hit
// Expected to be called once either from inside HitResponse or from outside (unclaimed hit)
func (g *Session) UpdateScores() {
	if len(g.Hits) == 0 {
		return
	}

	lastHit := g.Hits[len(g.Hits)-1]

	// adjust score for victim, depends who been shooting
	// for simplicity, make attacker non-nil
	attackerID := lastHit.AttackerID
	if attackerID == nil {
		attackerID = lastHit.VictimID // hit by unknown
	}
	// do adjustment
	for _, sd := range g.ScoreDamages {
		if *attackerID >= sd.Range.Min && *attackerID <= sd.Range.Max {
			victim, _ := g.Player(*lastHit.VictimID)
			victim.Score += sd.Score
			break
		}
	}

	// adjust score for attacker, depends who been hit
	// if there were no attacker (hit by unknown), no need to adjust any more scores
	if lastHit.AttackerID != nil {
		for _, sh := range g.ScoreHits {
			if *lastHit.VictimID >= sh.Range.Min && *lastHit.VictimID <= sh.Range.Max {
				attacker, _ := g.Player(*lastHit.AttackerID)
				attacker.Score += sh.Score
				break
			}
		}
	}

	// Sorts players by score, then by join time, descending
	slices.SortFunc(g.Players, func(a, b *Player) int {
		if a.Score == b.Score {
			return int(b.Joined.Sub(a.Joined).Milliseconds())
		}
		return b.Score - a.Score
	})
}

func (g *Session) Player(id byte) (player *Player, isNew bool) {
	for _, p := range g.Players {
		if p.ID == id {
			return p, false
		}
	}
	if g.IsEnded() {
		return nil, false
	}
	player = &Player{
		ID:          id,
		Name:        fmt.Sprintf("%X", id),
		Description: "Unknown",
		Lives:       255,
		Updated:     time.Now(),
	}
	g.Players = append(g.Players, player)
	return player, true
}

// Registration(1,0,0,0) -> Countdown(1,1,0,0) -> Battle(1,1,0) -> End(1,1,1,1)
func (g *Session) Advance() {
	switch {
	case g.IsRegistration():
		g.Timestamps.RegEnded = time.Now() // into countdown
	case g.IsCountdown():
		g.Timestamps.BatStarted = time.Now() // into battle
	case g.IsBattle():
		g.Timestamps.BatEnded = time.Now() // into end
	}
}

func (g *Session) IsRegistration() bool {
	return !g.Timestamps.RegStarted.IsZero() && g.Timestamps.RegEnded.IsZero()
}

func (g *Session) IsCountdown() bool {
	return !g.Timestamps.RegEnded.IsZero() && g.Timestamps.BatStarted.IsZero()
}

func (g *Session) IsBattle() bool {
	return !g.Timestamps.BatStarted.IsZero() && g.Timestamps.BatEnded.IsZero()
}

func (g *Session) IsEnded() bool {
	return !g.Timestamps.BatStarted.IsZero() && !g.Timestamps.BatEnded.IsZero()
}

func (st *SessionTimestamps) UpdateFromJSON(data map[string]interface{}) error {
	regStarted, err := handleTimeField(data, "regStarted")
	if err != nil && err != ErrMissingField {
		return err
	}
	if err == nil {
		st.RegStarted = regStarted
	}

	regEnded, err := handleTimeField(data, "regEnded")
	if err != nil && err != ErrMissingField {
		return err
	}
	if err == nil {
		st.RegEnded = regEnded
	}

	batStarted, err := handleTimeField(data, "batStarted")
	if err != nil && err != ErrMissingField {
		return err
	}
	if err == nil {
		st.BatStarted = batStarted
	}

	batEnded, err := handleTimeField(data, "batEnded")
	if err != nil && err != ErrMissingField {
		return err
	}
	if err == nil {
		st.BatEnded = batEnded
	}

	return nil
}

var ErrMissingField = fmt.Errorf("missing field")

func handleTimeField(data map[string]interface{}, key string) (time.Time, error) {
	obj, ok := data[key]
	if !ok {
		return time.Time{}, ErrMissingField
	}
	value, err := time.Parse(time.RFC3339, obj.(string))
	if err != nil {
		return time.Time{}, err
	}
	return value, nil
}
