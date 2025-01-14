package main

import (
	"errors"
	"strconv"
	"strings"

	"github.com/ysoldak/fpvc-lady/internal/game"
)

var ErrInvalidScoreConfig = errors.New("invalid score config")

// ParseScoreConfig from command-line arguments.
// Definition string format: "[minID[-maxID]:]score"
// Default minID is 0xA1, default maxID is 0xFF.
// Default maxID := minID if not specified.
// Example: "A1-FF:3" == "3", "A1:3" == "A1-A1:3"
func ParseScoreConfig(definition string) (sc *game.ScoreConfig, err error) {
	parts := strings.Split(definition, ":")
	min := uint64(0xA1)
	max := uint64(0xFF)
	score := 0
	switch len(parts) {
	case 1: // score only: "3" or "-1"
		score, err = strconv.Atoi(parts[0])
		if err != nil {
			return nil, err
		}
	case 2: // id range and score: "A1-B2:3" or "A1:3", etc
		ids := strings.Split(parts[0], "-")
		min, err = strconv.ParseUint(ids[0], 16, 8)
		if err != nil {
			return nil, err
		}
		max = min          // by default maxID is equal to minID
		if len(ids) == 2 { // maxID is set
			max, err = strconv.ParseUint(ids[1], 16, 8)
			if err != nil {
				return nil, err
			}
		}
		score, err = strconv.Atoi(parts[1])
		if err != nil {
			return nil, err
		}
	default:
		return nil, ErrInvalidScoreConfig
	}
	return &game.ScoreConfig{
		Range: game.IDRange{
			Min: byte(min),
			Max: byte(max),
		},
		Score: score,
	}, nil
}

// ParseScoreConfigs from command-line arguments.
// Comma-separated list of score config definitions.
func ParseScoreConfigs(definition string) (scs []game.ScoreConfig, err error) {
	definitions := strings.Split(definition, ",")
	for _, def := range definitions {
		sc, err := ParseScoreConfig(def)
		if err != nil {
			return nil, err
		}
		scs = append(scs, *sc)
	}
	return scs, nil
}
