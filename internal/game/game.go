package game

import (
	"fmt"
	"time"

	csp "github.com/ysoldak/fpvc-serial-protocol"
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

func (g *Game) Beacon(event *csp.Beacon) (player *Player, new bool) {
	player, new = g.Player(event.ID)
	player.Name = event.Name
	player.Description = event.Description
	player.Updated = time.Now()
	return
}

func (g *Game) HitRequest(event *csp.HitRequest) {
	victim, _ := g.Player(event.ID)
	victim.Lives = event.Lives
	g.Victim = victim
}

func (g *Game) HitResponse(event *csp.HitResponse) (victim *Player, ok bool) {
	attacker, _ := g.Player(event.ID)
	if attacker == nil {
		attacker = &Player{
			ID:    event.ID,
			Name:  fmt.Sprintf("%X", event.ID),
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
