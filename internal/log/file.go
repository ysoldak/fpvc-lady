package log

import (
	"fmt"
	"log"
	"os"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type File struct {
	file     *os.File
	messages chan csp.Message
}

func NewFile(path string) *File {

	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Println(err)
		return nil
	}

	fileLogger := File{
		messages: make(chan csp.Message, 10),
		file:     file,
	}

	go fileLogger.listenToMessages()
	return &fileLogger
}

func (f *File) LogMessage(message csp.Message) {
	f.messages <- message
}

func (f *File) LogString(line string) {
	out := log.New(f.file, "", 0)
	out.Println(line)
}

func (f *File) listenToMessages() {

	defer f.file.Close()

	out := log.New(f.file, "", log.Ldate|log.Ltime|log.Lmicroseconds)

	for message := range f.messages {
		line := ""
		switch message.Command {
		case csp.CommandBeacon:
			event := csp.NewBeaconFromMessage(&message)
			line = fmt.Sprintf("BEACN %02X %10s %20s", event.ID, event.Name, event.Description)
		case csp.CommandHit:
			if message.IsRequest() {
				event := csp.NewHitRequestFromMessage(&message)
				line = fmt.Sprintf("DAMAG %02X %d", event.ID, event.Lives)
			}
			if message.IsResponse() {
				event := csp.NewHitResponseFromMessage(&message)
				line = fmt.Sprintf("CLAIM %02X %d", event.ID, event.Power)
			}
		}
		if line != "" {
			out.Println(line)
		}
	}

}
