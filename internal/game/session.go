package game

import (
	"fmt"
	"slices"
	"strings"
	"time"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Hit struct {
	Attacker *Player
	Victim   *Player
}

type IDRange struct {
	Min byte `json:"min"`
	Max byte `json:"max"`
}

type ScoreConfig struct {
	Range IDRange `json:"range"`
	Score int     `json:"score"`
}

type Session struct {
	Active       bool          `json:"active"`
	Players      []*Player     `json:"players"`
	ScoreHits    []ScoreConfig `json:"-"`
	ScoreDamages []ScoreConfig `json:"-"`
	Victim       *Player       `json:"-"`
	LastHit      Hit           `json:"-"`
}

func NewSession(scoreHits, scoreDamages []ScoreConfig) Session {
	return Session{
		Players:      []*Player{},
		Active:       true,
		ScoreHits:    scoreHits,
		ScoreDamages: scoreDamages,
		LastHit:      Hit{},
	}
}

func (g *Session) Beacon(event *csp.Beacon) (player *Player, new bool) {
	if !g.Active {
		return
	}
	player, new = g.Player(event.ID)
	player.Name = strings.TrimSpace(event.Name)
	player.Description = strings.TrimSpace(event.Description)
	player.Updated = time.Now()
	return
}

func (g *Session) HitRequest(event *csp.HitRequest) {
	if !g.Active {
		return
	}
	victim, _ := g.Player(event.ID)
	victim.Lives = event.Lives - 1
	victim.Damage++
	victim.Updated = time.Now()
	g.Victim = victim
	g.LastHit = Hit{
		Attacker: nil,
		Victim:   victim,
	}
	// note: can't update scores here, because we don't know who was shooting
}

func (g *Session) HitResponse(event *csp.HitResponse) (victim *Player) {
	if !g.Active {
		return nil
	}
	attacker, _ := g.Player(event.ID)
	if g.Victim != nil {
		attacker.Hits++
		attacker.Updated = time.Now()
		victim = g.Victim
		g.LastHit = Hit{
			Attacker: attacker,
			Victim:   victim,
		}
		g.UpdateScores() // update scores, all information is available
		g.Victim = nil
		return victim
	}
	return nil
}

// UpdateScores adjusts scores for last hit
// Expected to be called once either from inside HitResponse or from outside (unclaimed hit)
func (g *Session) UpdateScores() {
	if !g.Active {
		return
	}
	if g.LastHit.Attacker == nil && g.LastHit.Victim == nil {
		return
	}

	// adjust score for victim, depends who been shooting
	// for simplicity, make attacker non-nil
	attacker := g.LastHit.Attacker
	if attacker == nil {
		attacker = g.LastHit.Victim // hit by unknown
	}
	// do adjustment
	for _, sd := range g.ScoreDamages {
		if attacker.ID >= sd.Range.Min && attacker.ID <= sd.Range.Max {
			g.LastHit.Victim.Score += sd.Score
			break
		}
	}

	// adjust score for attacker, depends who been hit
	// if there were no attacker (hit by unknown), no need to adjust any more scores
	if g.LastHit.Attacker != nil {
		for _, sh := range g.ScoreHits {
			if g.LastHit.Victim.ID >= sh.Range.Min && g.LastHit.Victim.ID <= sh.Range.Max {
				g.LastHit.Attacker.Score += sh.Score
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
	if !g.Active {
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

func (g *Session) Start() {
	if g.Active {
		return
	}
	g.Players = g.Players[0:0]
	g.Victim = nil
	g.LastHit = Hit{}
	g.Active = true
}

func (g *Session) Stop() {
	g.Active = false
}

func (g *Session) IsActive() bool {
	return g.Active
}
