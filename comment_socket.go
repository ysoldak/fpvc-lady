package main

import (
	"encoding/json"
	"fmt"
)

const (
	SocketMessageTypeConfig  = "config"
	SocketMessageTypeSession = "session"
)

type SocketMessage struct {
	Type    string      `json:"type"`
	Seq     string      `json:"seq"`
	Payload interface{} `json:"payload"`
}

func handleSocketMessage(message string) {
	switch message {
	case "table":
		response := ""
		for _, line := range sessionTable() {
			response += fmt.Sprintln(line)
		}
		wsOutCh <- response
	case "start":
		session.Start()
	case "stop":
		session.Stop()
	default:
		var msg SocketMessage
		err := json.Unmarshal([]byte(message), &msg)
		if err != nil {
			fmt.Println("Error parsing websocket message:", err)
			return
		}
		switch msg.Type {
		case SocketMessageTypeConfig:
			if msg.Payload != nil {
				newConfig, err := NewConfigFromMap(msg.Payload.(map[string]interface{}))
				if err != nil {
					fmt.Println("Invalid config data", msg.Payload)
					return
				}
				applyConfig(newConfig)
			}
			sendSocket(SocketMessage{Type: SocketMessageTypeConfig, Seq: msg.Seq, Payload: config})
		case SocketMessageTypeSession:
			if msg.Payload != nil {
				m := msg.Payload.(map[string]interface{})
				if m["active"] != nil {
					if m["active"].(bool) {
						session.Start()
					} else {
						session.Stop()
					}
				} else {
					fmt.Println("Invalid session data, can send only 'active' field", msg.Payload)
					return
				}
			}
			sendSocket(SocketMessage{Type: SocketMessageTypeSession, Seq: msg.Seq, Payload: session})
		}
	}
}

func sendSocket(message SocketMessage) error {
	outMsgBytes, err := json.Marshal(message)
	if err != nil {
		return err
	}
	select {
	case wsOutCh <- string(outMsgBytes):
		// nothing
	default:
		// fmt.Println("Websocket output channel is full, dropping message")
	}
	return nil
}
