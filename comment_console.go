package main

import (
	"fmt"
	"strings"

	"github.com/gdamore/tcell/v2"
	"github.com/mattn/go-runewidth"
)

func dumpTable() {
	fmt.Println()
	for _, line := range sessionTable() {
		fmt.Println(line)
	}
}

func printTable() {
	table := sessionTable()
	tHeight := len(table)
	tWidth := len([]rune(table[0]))

	title := locale.Label("title") //"FPVCombat Announcer"
	state := locale.Label("connected")
	if !session.Active {
		state = locale.Label("disconnected")
	}
	header := fmt.Sprintf("%s%s%s", title, strings.Repeat(" ", tWidth-len([]rune(title))-len([]rune(state))), strings.ToUpper(state))

	config := fmt.Sprintf(
		locale.Label("configSource")+": %s, "+locale.Label("configLocale")+": %s, "+locale.Label("configCheers")+": %s, "+locale.Label("configLives")+": %s, "+locale.Label("configSpeech")+": %s",
		config.Source, config.Locale, onoff(config.SpeakCheers), onoff(config.SpeakLives), config.SpeakCommand)
	configLine := fmt.Sprintf("%s%s", config, strings.Repeat(" ", tWidth-len([]rune(config))))

	keys := "[ESC/Ctrl+C] " + locale.Label("keysQuit") + "  [Space] " + locale.Label("keysToggleConnection") + "  [C] " + locale.Label("keysToggleCheers") + "  [L] " + locale.Label("keysToggleLives") + ""
	version := "v" + Version
	footer := fmt.Sprintf("%s%s%s", keys, strings.Repeat(" ", tWidth-len([]rune(keys))-len([]rune(version))), version)

	emitStr(screen, 0, 0, tcell.StyleDefault, fmt.Sprintf("┌%s┐", strings.Repeat("─", tWidth+2)))
	emitStr(screen, 0, 1, tcell.StyleDefault, fmt.Sprintf("│ %s │", header))
	emitStr(screen, 0, 2, tcell.StyleDefault, fmt.Sprintf("├%s┤", strings.Repeat("─", tWidth+2)))
	for i, line := range sessionTable() {
		emitStr(screen, 0, i+3, tcell.StyleDefault, "│ "+line+" │")
	}
	emitStr(screen, 0, 3+tHeight+0, tcell.StyleDefault, fmt.Sprintf("├%s┤", strings.Repeat("─", tWidth+2)))
	emitStr(screen, 0, 3+tHeight+1, tcell.StyleDefault, fmt.Sprintf("│ %s │", configLine))
	emitStr(screen, 0, 3+tHeight+2, tcell.StyleDefault, fmt.Sprintf("├%s┤", strings.Repeat("─", tWidth+2)))
	emitStr(screen, 0, 3+tHeight+3, tcell.StyleDefault, fmt.Sprintf("│ %s │", footer))
	emitStr(screen, 0, 3+tHeight+4, tcell.StyleDefault, fmt.Sprintf("└%s┘", strings.Repeat("─", tWidth+2)))
	screen.Show()
}

func sessionTable() []string {
	table := []string{}
	header := fmt.Sprintf(
		" ID | %-10s | %-20s | %-16s || %12s | %12s | %10s",
		strings.TrimSpace(locale.Label("tableName")),
		strings.TrimSpace(locale.Label("tableDescription")),
		strings.TrimSpace(locale.Label("tableUpdated")),
		strings.TrimSpace(locale.Label("tableHits")),
		strings.TrimSpace(locale.Label("tableDamage")),
		strings.TrimSpace(locale.Label("tableLives")))
	table = append(table, header)

	table = append(table, "--- | ---------- | -------------------- | ---------------- || ------------ | ------------ | ----------")
	for _, p := range session.Players {
		updated := p.Updated.Format("15:04:05.000")
		table = append(table, fmt.Sprintf(" %X | %-10s | %-20s | %-16s || %12d | %12d | %10d", p.ID, printableString(p.Name), printableString(p.Description), updated, p.Hits, p.Damage, p.Lives))
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

func emitStr(s tcell.Screen, x, y int, style tcell.Style, str string) {
	for _, c := range str {
		var comb []rune
		w := runewidth.RuneWidth(c)
		if w == 0 {
			comb = []rune{c}
			c = ' '
			w = 1
		}
		s.SetContent(x, y, c, comb, style)
		x += w
	}
}

func onoff(b bool) string {
	if b {
		return locale.Label("on")
	}
	return locale.Label("off")
}
