package game

import (
	"fmt"
	"time"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Game struct {
	Players []*Player
	Victim  *Player

	active bool
}

func NewGame() Game {
	return Game{
		Players: []*Player{},
		active:  true,
	}
}

func (g *Game) Beacon(event *csp.Beacon) (player *Player, new bool) {
	if !g.active {
		return
	}
	player, new = g.Player(event.ID)
	player.Name = event.Name
	player.Description = event.Description
	player.Updated = time.Now()
	return
}

func (g *Game) HitRequest(event *csp.HitRequest) {
	if !g.active {
		return
	}
	victim, _ := g.Player(event.ID)
	victim.Lives = event.Lives - 1
	victim.Deaths++
	victim.Updated = time.Now()
	g.Victim = victim
}

func (g *Game) HitResponse(event *csp.HitResponse) (victim *Player) {
	if !g.active {
		return nil
	}
	attacker, _ := g.Player(event.ID)
	if g.Victim != nil {
		attacker.Kills++
		attacker.Updated = time.Now()
		victim = g.Victim
		g.Victim = nil
		return victim
	}
	return nil
}

func (g *Game) Player(id byte) (player *Player, isNew bool) {
	for _, p := range g.Players {
		if p.ID == id {
			return p, false
		}
	}
	if !g.active {
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

func (g *Game) Start() {
	g.Players = g.Players[0:0]
	g.Victim = nil
	g.active = true
}

func (g *Game) Stop() {
	g.active = false
}

func (g *Game) IsActive() bool {
	return g.active
}
