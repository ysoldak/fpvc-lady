package game

import (
	"fmt"
	"time"

	"github.com/ysoldak/fpvc-lady/internal/csp"
)

type Game struct {
	Players []*Player

	Victim *Player
}

func NewGame() Game {
	return Game{
		Players: []*Player{},
	}
}

func (g *Game) Beacon(event csp.Beacon) (player *Player, new bool) {
	player, new = g.Player(event.PlayerID)
	player.Name = event.Name
	player.Description = event.Description
	player.Updated = time.Now()
	return
}

func (g *Game) Hit(event csp.Hit) {
	victim, _ := g.Player(event.PlayerID)
	victim.Lives = event.Lives
	g.Victim = victim
}

func (g *Game) Claim(event csp.Claim) (victim *Player, ok bool) {
	attacker, _ := g.Player(event.PlayerID)
	if attacker == nil {
		attacker = &Player{
			ID:    event.PlayerID,
			Name:  fmt.Sprintf("%X", event.PlayerID),
			Lives: 255,
		}
		g.Players = append(g.Players, attacker)
	}
	victim = g.Victim
	if g.Victim != nil {
		g.Victim = nil
		attacker.Kills++
		victim.Deaths++
		victim.Lives--
	}
	return victim, victim != nil
}

func (g *Game) Player(id byte) (player *Player, isNew bool) {
	for _, p := range g.Players {
		if p.ID == id {
			return p, false
		}
	}
	player = &Player{
		ID:          id,
		Name:        fmt.Sprintf("%X", id),
		Description: "Unknown",
		Lives:       255,
	}
	g.Players = append(g.Players, player)
	return player, true
}

func (g *Game) Table() []string {
	table := []string{}
	table = append(table, " ID | Name       | Description        | Updated      || Kills | Deaths | Lives ")
	table = append(table, "--- | ---------- | ------------------ | ------------ || ----- | ------ | ------")
	for _, p := range g.Players {
		updated := p.Updated.Format("15:04:05.000")
		table = append(table, fmt.Sprintf(" %X | %-10s | %-20s | %s || %5d | %6d | %5d", p.ID, p.Name, p.Description, updated, p.Kills, p.Deaths, p.Lives))
	}
	return table
}
