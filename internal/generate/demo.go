package generate

import (
	"fmt"
	"time"

	"math/rand"

	"github.com/ysoldak/fpvc-lady/internal/game"
	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Demo struct {
	speed int // avg hits per minute
}

func NewDemo(speed int) *Demo {
	return &Demo{
		speed: speed,
	}
}

func (d *Demo) Generate(output chan csp.Message) {

	// all players in the simulated game
	state := []game.Player{
		{ID: 0xA1, Name: "ALPHA     ", Description: "2.8.0 2.6           ", Lives: 50},
		{ID: 0xB3, Name: "BRAVO     ", Description: "2.8.0 2.5           ", Lives: 100},
		{ID: 0xC5, Name: "CHARLIE   ", Description: "2.8.0 2.6           ", Lives: 150},
		{ID: 0xD4, Name: "DELTA     ", Description: "2.8.0 2.6           ", Lives: 250},
	}

	// randomize player boot and join the game moments
	delays := []int{}
	for range state {
		delays = append(delays, rand.Intn(len(state)))
	}

	fmt.Println("Demo started.")

	time.Sleep(1 * time.Second)

	// send player beacons
	for i := 0; i < len(state)+1; i++ {
		for j, v := range state {
			if delays[j] <= i { // just simulate they not all boot same time
				output <- *csp.NewBeacon(v.ID, v.Name, v.Description).Message()
			}
			time.Sleep(1 * time.Second) // almost correct, offset depends on player number in a team: each 1 adds ~100ms deplay
		}
		time.Sleep(2 * time.Second)
	}

	// fight until one of players is out of lives
	for {
		vi := rand.Intn(len(state))
		ai := rand.Intn(len(state))
		for ai == vi {
			ai = rand.Intn(len(state))
		}
		v := state[vi]
		a := state[ai]
		output <- *csp.NewHitRequest(v.ID, v.Lives).Message()
		if vi != 0 || state[vi].Lives != 5 { // simulate unclaimed hit for ALPHA when they have 5 lives
			time.Sleep(100 * time.Millisecond)
			output <- *csp.NewHitResponse(a.ID, 3).Message()
		}

		delay := 60/d.speed + rand.Intn(5) - 2 // desired frequency +-2 sec
		if delay < 0 {
			delay = 1
		}
		time.Sleep(time.Duration(delay) * time.Second)

		state[vi].Lives--
		if state[vi].Lives == 0 {
			break
		}
	}

	fmt.Println("Demo finished.")
}
