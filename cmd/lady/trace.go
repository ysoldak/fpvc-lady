package main

import (
	"log"
	"os"
)

var traceChan = make(chan string, 10)

func trace() {

	filename := "fpvcc-events.log"
	f, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Println(err)
	}
	defer f.Close()

	tracer := log.New(f, "", log.Ldate|log.Ltime|log.Lmicroseconds)

	for {
		event := <-traceChan
		tracer.Println(event)
	}

}
