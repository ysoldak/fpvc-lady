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
var wsLogCh chan string = make(chan string, 10)

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

	// forward messages
	go forwardOutbound(c)
	go forwardInbound(c)
	go logWebsocket()

	select {} // idiomatic way to block forever consuming minimal resources
}

// forwardOutbound sends messages from the local wsOutCh to the client
func forwardOutbound(c *websocket.Conn) {
	// empty output buffer (messages may have accumulated here before client connected)
	for len(wsOutCh) > 0 {
		<-wsOutCh
	}
	for message := range wsOutCh {
		wsLogCh <- string("< " + message)
		err := c.WriteMessage(websocket.TextMessage, []byte(message))
		if err != nil {
			if err == websocket.ErrCloseSent {
				return // client disconnected
			}
			fmt.Println("ws write:", err)
		}
	}
}

// forwardInbound sends messages from the client to the local wsInCh
func forwardInbound(c *websocket.Conn) {
	for {
		mtype, message, err := c.ReadMessage()
		if err != nil {
			if !websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				fmt.Println("read:", err)
			}
			break
		}
		if mtype != websocket.TextMessage {
			continue
		}
		wsLogCh <- string("> " + string(message))
		wsInCh <- string(message)
	}
}

func logWebsocket() {
	var file *os.File = nil
	var filePath string = ""
	defer func() {
		if file != nil {
			file.Close()
		}
	}()
	for message := range wsLogCh {
		if config.LogSocket != filePath { // config changed or first run
			if file != nil {
				file.Close()
			}
			filePath = config.LogSocket
			if filePath != "" {
				file, _ = os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
			}
		}
		if file != nil {
			file.WriteString(message + "\n")
		}
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
