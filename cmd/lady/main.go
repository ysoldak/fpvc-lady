package main

import (
	"log"
	"os"

	"github.com/urfave/cli/v2"
)

var Version = "0.0.0"

func main() {
	app := cli.NewApp()
	app.Name = "fpvc-lady"

	app.Flags = getFlags()
	app.Action = commentAction
	app.Version = Version

	if err := app.Run(os.Args); err != nil {
		log.Fatalf("error: %s\n", err.Error())
	}
}
