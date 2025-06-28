package main

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} // use default options

type Server struct {
	port int64

	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client

	broadcast chan string // Channel for broadcasting messages to clients
	receive   chan string // Channel for receiving messages from clients
	log       chan string // Channel for logging messages

	mutex sync.RWMutex
}

func NewServer(port int64, inCh, outCh chan string) *Server {
	return &Server{
		port:       port,
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  outCh,
		receive:    inCh,
		log:        make(chan string, 10),
	}
}

func (s *Server) Run() {
	// Start the websocket logger
	go s.logger()

	// Start the client manager
	go s.clienter()

	// Handle static files
	handleStatic()

	// Handle websocket connections
	http.HandleFunc("/ws", s.socket)

	// Start the server
	err := http.ListenAndServe(":"+strconv.FormatInt(s.port, 10), nil)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Println("server closed")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}
}

// ClientCount returns the number of connected clients
func (s *Server) ClientCount() int {
	s.mutex.RLock()
	defer s.mutex.RUnlock()
	return len(s.clients)
}

// logger writes log messages to a file specified in the configuration
func (s *Server) logger() {
	var file *os.File = nil
	var filePath string = ""
	defer func() {
		if file != nil {
			file.Close()
		}
	}()
	for message := range s.log {
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

// clienter handles client registration, unregistration, and broadcasting
func (s *Server) clienter() {
	for {
		select {
		case client := <-s.register:
			s.mutex.Lock()
			s.clients[client] = true
			s.mutex.Unlock()

		case client := <-s.unregister:
			s.mutex.Lock()
			if _, ok := s.clients[client]; ok {
				delete(s.clients, client)
				close(client.send)
			}
			s.mutex.Unlock()

		case message := <-s.broadcast:
			s.log <- "< " + message
			s.mutex.RLock()
			for client := range s.clients {
				select {
				case client.send <- message:
				default:
					// Client's send channel is full, remove client
					delete(s.clients, client)
					close(client.send)
				}
			}
			s.mutex.RUnlock()
		}
	}
}

func (s *Server) socket(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("upgrade:", err)
		return
	}

	client := NewClient(conn, s)

	s.register <- client

	// Start goroutines for this client
	go client.writePump()
	go client.readPump()
}
