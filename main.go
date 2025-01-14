package main

import (
	"fmt"
	"os"

	"github.com/urfave/cli/v2"
)

var Version = "0.0.0"

func main() {
	app := cli.NewApp()
	app.Name = "fpvc-lady"
	app.Usage = "FPVCombat Announcer"

	app.Flags = getFlags()
	app.Action = commentAction
	app.Version = Version

	err := app.Run(os.Args)
	if err != nil {
		fmt.Printf("error: %s\n", err.Error())
		os.Exit(1)
	}
}
