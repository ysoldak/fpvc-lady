package main

import (
	"strconv"
	"strings"

	"github.com/ysoldak/fpvc-lady/internal/game"
	"github.com/ysoldak/fpvc-lady/internal/tts"
)

func sayHit(victim, attacker *game.Player) {
	block := tts.PhraseBlock{}

	hitPhrase := locale.Comment("hit")
	hitPhrase = strings.ReplaceAll(hitPhrase, "{victim}", victim.Name)
	block = append(block, tts.Phrase{Text: hitPhrase, Prio: 100})

	if attacker != nil {
		hitByPhrase := locale.Comment("hit_by")
		hitByPhrase = strings.ReplaceAll(hitByPhrase, "{attacker}", attacker.Name)
		hitByPhrase = strings.ReplaceAll(hitByPhrase, "{victim}", victim.Name)
		block = append(block, tts.Phrase{Text: hitByPhrase, Prio: 3})
	}

	if config.SpeakLives {
		livesPhrase := locale.Comment("lives_left")
		livesPhrase = strings.ReplaceAll(livesPhrase, "{lives}", strconv.Itoa(int(victim.Lives)))
		lastPhraseInBlock := block[len(block)-1] // we copy last phrase in the block (can be w/ or w/o attacker) and append "lives left" to it.
		block = append(block, tts.Phrase{Text: lastPhraseInBlock.Text + " " + livesPhrase, Prio: 2})
	}

	speaker.SayBlock(block)

	if config.SpeakCheers {
		speaker.Say(locale.RandomCheer(), 2)
	}
}
