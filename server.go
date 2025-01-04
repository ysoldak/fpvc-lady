package main

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} // use default options

var wsInCh chan string = make(chan string, 10)
var wsOutCh chan string = make(chan string, 10)

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
	// forward all outbound messages
	go func() {
		for message := range wsOutCh {
			err = c.WriteMessage(websocket.TextMessage, []byte(message))
			if err != nil {
				fmt.Println("ws write:", err)
			}
		}
	}()
	// forward all inbound messages
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			fmt.Println("read:", err)
			break
		}
		if mt != websocket.TextMessage {
			continue
		}
		wsInCh <- string(message)
	}
}

func doServe(port int64) {

	handleStatic()

	http.HandleFunc("/ws", socket)

	err := http.ListenAndServe(":"+strconv.FormatInt(port, 10), nil)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Println("server closed")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}

}
