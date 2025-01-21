package main

import (
	"fmt"
	"strings"

	"github.com/gdamore/tcell/v2"
	"github.com/mattn/go-runewidth"
)

var showConfigLines = false

func dumpTable() {
	fmt.Println()
	for _, line := range sessionTable() {
		fmt.Println(line)
	}
}

func printTable() {
	table := sessionTableDecorated(true)
	tHeight := len(table)
	tWidth := len([]rune(table[0]))

	title := locale.Label("title") //"FPVCombat Announcer"
	state := locale.Label("sessionActive")
	if !session.Active {
		state = locale.Label("sessionStopped")
	}
	header := fmt.Sprintf("%s%s%s", title, strings.Repeat(" ", tWidth-2-len([]rune(title))-len([]rune(state))), strings.ToUpper(state))

	configLines := []string{
		locale.Label("configSource") + ":\"" + config.Source + "\" " + locale.Label("configLocale") + ":\"" + config.Locale + "\" " + locale.Label("configSpeech") + ":\"" + config.SpeakCommand + "\"",
	}
	if showConfigLines {
		configLines = []string{
			locale.Label("configSource") + ":" + config.Source,
			locale.Label("configLocale") + ":" + config.Locale,
			locale.Label("configSpeech") + ":" + config.SpeakCommand,
			locale.Label("configScoreHit") + ":" + config.ScoreHit,
			locale.Label("configScoreDamage") + ":" + config.ScoreDamage,
			locale.Label("configCheers") + ":" + onoff(config.SpeakCheers),
			locale.Label("configLives") + ":" + onoff(config.SpeakLives),
		}
	}
	cHeight := len(configLines)

	bullet := " " + string(tcell.RuneBullet) + " "
	keys := "[ESC/Q] " + locale.Label("keysQuit") +
		bullet + "[Space] " + locale.Label("keysToggleSession") +
		bullet + "[C] " + locale.Label("keysToggleCheers") +
		bullet + "[L] " + locale.Label("keysToggleLives") +
		bullet + "[X] " + locale.Label("keysToggleConfig")
	version := "v" + Version
	footer := fmt.Sprintf("%s%s%s", keys, strings.Repeat(" ", tWidth-2-len([]rune(keys))-len([]rune(version))), version)

	// header
	printStr(screen, 0, 0, fmt.Sprintf("┌%s┐", strings.Repeat("─", tWidth)))
	printStr(screen, 0, 1, fmt.Sprintf("│ %s │", header))
	printStr(screen, 0, 2, fmt.Sprintf("├%s┤", strings.Repeat("─", tWidth)))

	// table
	for i, line := range table {
		printStr(screen, 0, i+3, "│"+line+"│")
	}
	printStr(screen, 0, 3+tHeight+0, fmt.Sprintf("├%s┤", strings.Repeat("─", tWidth)))

	// config
	if showConfigLines {
		for i, line := range configLines {
			parts := strings.SplitN(line, ":", 2)
			fmtLine := fmt.Sprintf("%-20s %s", parts[0], parts[1])
			padLine := fmt.Sprintf("%s%s", fmtLine, strings.Repeat(" ", tWidth-2-len([]rune(fmtLine))))
			printStr(screen, 0, 3+tHeight+i+1, fmt.Sprintf("│ %s │", padLine))
		}
	} else {
		padLine := fmt.Sprintf("%s%s^", configLines[0], strings.Repeat(" ", tWidth-2-1-len([]rune(configLines[0]))))
		printStr(screen, 0, 3+tHeight+1, fmt.Sprintf("│ %s │", padLine))
	}
	printStr(screen, 0, 3+tHeight+cHeight+1, fmt.Sprintf("├%s┤", strings.Repeat("─", tWidth)))

	// footer
	printStr(screen, 0, 3+tHeight+cHeight+2, fmt.Sprintf("│ %s │", footer))
	printStr(screen, 0, 3+tHeight+cHeight+3, fmt.Sprintf("└%s┘", strings.Repeat("─", tWidth)))
	screen.Show()
}

func sessionTable() []string {
	return sessionTableDecorated(false)
}

func sessionTableDecorated(decorate bool) []string {
	table := []string{}
	header := fmt.Sprintf(
		" ID | %-10s | %-20s | %-16s || %12s | %12s | %10s || %10s ",
		strings.TrimSpace(locale.Label("tableName")),
		strings.TrimSpace(locale.Label("tableDescription")),
		strings.TrimSpace(locale.Label("tableUpdated")),
		strings.TrimSpace(locale.Label("tableHits")),
		strings.TrimSpace(locale.Label("tableDamage")),
		strings.TrimSpace(locale.Label("tableLives")),
		strings.TrimSpace(locale.Label("tableScore")),
	)
	table = append(table, header)

	table = append(table, " -- | ---------- | -------------------- | ---------------- || ------------ | ------------ | ---------- || ---------- ")
	for _, p := range session.Players {
		updated := p.Updated.Format("15:04:05.000")
		hits := fmt.Sprintf("%d", p.Hits)
		damage := fmt.Sprintf("%d", p.Damage)
		if decorate && len(session.Hits) > 0 {
			lastHit := session.Hits[len(session.Hits)-1]
			if lastHit.AttackerID != nil && p.ID == *lastHit.AttackerID {
				hits = fmt.Sprintf("%c %s", tcell.RuneRArrow, hits)
			}
			if lastHit.VictimID != nil && p.ID == *lastHit.VictimID {
				damage = fmt.Sprintf("%c %s", tcell.RuneRArrow, damage)
			}
		}
		table = append(table, fmt.Sprintf(" %X | %-10s | %-20s | %-16s || %12s | %12s | %10d || %10d ", p.ID, printableString(p.Name), printableString(p.Description), updated, hits, damage, p.Lives, p.Score))
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

func printStr(s tcell.Screen, x, y int, str string) {
	for _, c := range str {
		var comb []rune
		w := runewidth.RuneWidth(c)
		if w == 0 {
			comb = []rune{c}
			c = ' '
			w = 1
		}
		s.SetContent(x, y, c, comb, tcell.StyleDefault)
		x += w
	}
}

func onoff(b bool) string {
	if b {
		return locale.Label("on")
	}
	return locale.Label("off")
}
