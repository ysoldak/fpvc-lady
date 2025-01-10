package main

import (
	"fmt"
	"strings"
)

func printTable() {
	fmt.Println()
	fmt.Println()
	fmt.Println()
	for _, line := range sessionTable() {
		fmt.Println(line)
	}
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

	table = append(table, "--- | ---------- | -------------------- | ---------------- || ------------ | ------------ | -----------")
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
