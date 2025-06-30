package main

import (
	"fmt"

	"github.com/gorilla/websocket"
)

// Client represents a websocket client
type Client struct {
	conn   *websocket.Conn
	send   chan string
	server *Server
}

func NewClient(conn *websocket.Conn, server *Server) *Client {
	return &Client{
		conn:   conn,
		server: server,
		send:   make(chan string, 256),
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			if err != websocket.ErrCloseSent {
				fmt.Println("ws write:", err)
			}
			return
		}
	}
}

// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.server.unregister <- c
		c.conn.Close()
	}()

	for {
		mtype, message, err := c.conn.ReadMessage()
		if err != nil {
			if !websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				fmt.Println("read:", err)
			}
			break
		}
		if mtype != websocket.TextMessage {
			continue
		}
		c.server.log <- "> " + string(message)
		c.server.receive <- string(message)
	}
}
