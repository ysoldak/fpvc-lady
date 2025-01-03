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

func (g *Game) Table() []string {
	table := []string{}
	table = append(table, " ID | Name       | Description          | Updated      || Kills | Deaths | Lives ")
	table = append(table, "--- | ---------- | -------------------- | ------------ || ----- | ------ | ------")
	for _, p := range g.Players {
		updated := p.Updated.Format("15:04:05.000")
		table = append(table, fmt.Sprintf(" %X | %-10s | %-20s | %s || %5d | %6d | %5d", p.ID, printableString(p.Name), printableString(p.Description), updated, p.Kills, p.Deaths, p.Lives))
	}
	return table
}

func printableString(str string) string {
	result := str
	for i := 0; i < len(result); i++ {
		if result[i] < 0x20 || result[i] > 0x7E {
			result = result[:i] + "?" + result[i+1:]
		}
	}
	return result
}
