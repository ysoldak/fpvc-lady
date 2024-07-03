package game

import "github.com/ysoldak/fpvc-lady/internal/csp"

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
	var victim *Player = nil
	for _, p := range g.Players {
		if p.ID == event.PlayerID {
			victim = p
			victim.Lives = event.Lives
			break
		}
	}
	if victim == nil {
		victim = &Player{
			ID:    event.PlayerID,
			Name:  "Player " + string(event.PlayerID),
			Lives: event.Lives,
		}
		g.Players = append(g.Players, victim)
	}
	g.Victim = victim
}

func (g *Game) Claim(event csp.Claim) (victim *Player, ok bool) {
	var attacker *Player = nil
	for _, p := range g.Players {
		if p.ID == event.PlayerID {
			attacker = p
			break
		}
	}
	if attacker == nil {
		attacker = &Player{
			ID:    event.PlayerID,
			Name:  "Player " + string(event.PlayerID),
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
