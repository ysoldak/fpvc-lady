package main

import (
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/websocket"
	"github.com/urfave/cli/v2"
)

//go:embed front/*
var static embed.FS

var upgrader = websocket.Upgrader{} // use default options

func socket(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("upgrade:", err)
		return
	}
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			fmt.Println("read:", err)
			break
		}
		switch string(message) {
		case "table":
			response := ""
			for _, line := range g.Table() {
				response += fmt.Sprintln(line)
			}

			err = c.WriteMessage(mt, []byte(response))
			if err != nil {
				fmt.Println("ws write:", err)
			}
		case "start":
			g.Start()
		case "stop":
			g.Stop()
		default:
			println("Unknown websocket message:", string(message))
		}
	}
}

func doServe(cc *cli.Context) {

	http.HandleFunc("/ws", socket)

	contentStatic, _ := fs.Sub(static, "front")
	http.Handle("/", http.FileServer(http.FS(contentStatic)))

	port := int64(cc.Int(flagHttpPort))

	err := http.ListenAndServe(":"+strconv.FormatInt(port, 10), nil)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Println("server closed")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}

}
