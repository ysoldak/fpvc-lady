package main

import (
	"log"
	"os"

	"github.com/urfave/cli/v2"
)

func main() {
	app := cli.NewApp()
	app.Name = "fpvc-lady"

	app.Flags = getFlags()
	app.Action = commentAction

	if err := app.Run(os.Args); err != nil {
		log.Fatalf("error: %s\n", err.Error())
	}
}
