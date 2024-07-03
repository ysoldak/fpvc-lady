package game

import (
	"fmt"

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

func (g *Game) Hit(event csp.Hit) {
	victim := g.Player(event.PlayerID)
	if victim == nil {
		victim = &Player{
			ID:    event.PlayerID,
			Name:  fmt.Sprintf("%X", event.PlayerID),
			Lives: event.Lives,
		}
		g.Players = append(g.Players, victim)
	}
	victim.Lives = event.Lives
	g.Victim = victim
}

func (g *Game) Claim(event csp.Claim) (victim *Player, ok bool) {
	attacker := g.Player(event.PlayerID)
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

func (g *Game) Player(id byte) *Player {
	for _, p := range g.Players {
		if p.ID == id {
			return p
		}
	}
	return nil
}

func (g *Game) Table() []string {
	table := []string{}
	table = append(table, " ID | Name       | Kills | Deaths | Lives ")
	for _, p := range g.Players {
		table = append(table, fmt.Sprintf(" %X | %-10s | %5d | %6d | %5d ", p.ID, p.Name, p.Kills, p.Deaths, p.Lives))
	}
	return table
}
