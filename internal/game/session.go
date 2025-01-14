package game

import (
	"fmt"
	"strings"
	"time"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Hit struct {
	Attacker *Player
	Victim   *Player
}

type Session struct {
	Active  bool      `json:"active"`
	Players []*Player `json:"players"`
	Victim  *Player   `json:"-"`
	LastHit Hit       `json:"-"`
}

func NewSession() Session {
	return Session{
		Players: []*Player{},
		Active:  true,
		LastHit: Hit{},
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
		g.Victim = nil
		return victim
	}
	return nil
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
