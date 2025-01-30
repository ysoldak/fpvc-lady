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
	Error   string      `json:"error"`
}

func handleSocketMessage(message string) {
	var msg SocketMessage
	err := json.Unmarshal([]byte(message), &msg)
	if err != nil {
		return
	}
	switch msg.Type {
	case SocketMessageTypeConfig:
		response := SocketMessage{Type: SocketMessageTypeConfig, Seq: msg.Seq}
		if msg.Payload != nil {
			newConfig, err := NewConfigFromMap(msg.Payload.(map[string]interface{}))
			if err != nil {
				response.Error = fmt.Errorf("invalid config data, %w", err).Error()
			} else {
				applyConfig(newConfig)
			}
		}
		response.Payload = config
		sendSocket(response)
	case SocketMessageTypeSession:
		response := SocketMessage{Type: SocketMessageTypeSession, Seq: msg.Seq}
		if msg.Payload != nil {
			m := msg.Payload.(map[string]interface{})
			ts, ok := m["timestamps"]
			if ok {
				err := session.Timestamps.UpdateFromJSON(ts.(map[string]interface{}))
				if err != nil {
					response.Error = fmt.Errorf("invalid session data, failed to parse timestamps: %w", err).Error()
				}
			}
		}
		response.Payload = session
		sendSocket(response)
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
