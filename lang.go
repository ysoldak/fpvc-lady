package main

import (
	"bytes"
	"math/rand"
	"os"
	"strings"
)

type Lang struct {
	comments map[string]string
	labels   map[string]string
	cheers   []string
}

func NewLang(id string) *Lang {
	cheersFile := "lang/cheers.en.txt"
	commentsFile := "lang/comments.en.txt"
	labelsFile := "lang/labels.en.txt"

	if id != "en" {
		files, err := os.ReadDir("lang")
		if err != nil {
			panic(err)
		}
		for _, file := range files {
			if file.Name() == "comments."+id+".txt" {
				commentsFile = "lang/" + file.Name()
			} else if file.Name() == "labels."+id+".txt" {
				labelsFile = "lang/" + file.Name()
			} else if file.Name() == "cheers."+id+".txt" {
				cheersFile = "lang/" + file.Name()
			}
		}
	}

	return &Lang{
		comments: fileToMap(commentsFile),
		labels:   fileToMap(labelsFile),
		cheers:   fileToSlice(cheersFile),
	}
}

func (l *Lang) Comment(id string) string {
	return l.comments[id]
}

func (l *Lang) Label(id string) string {
	return l.labels[id]
}

func (l *Lang) RandomCheer() string {
	return l.cheers[rand.Intn(len(l.cheers))]
}

func fileToSlice(file string) []string {
	content, err := os.ReadFile(file)
	if err != nil {
		panic(err)
	}
	result := make([]string, 0)
	for _, line := range strings.Split(string(content), "\n") {
		if len(line) == 0 || line[0] == '#' {
			continue
		}
		result = append(result, line)
	}
	return result
}

func fileToMap(file string) map[string]string {
	content, err := os.ReadFile(file)
	if err != nil {
		panic(err)
	}
	result := make(map[string]string)
	for _, line := range strings.Split(string(content), "\n") {
		if len(line) == 0 || line[0] == '#' {
			continue
		}
		parts := bytes.SplitN([]byte(line), []byte{'='}, 2)
		if len(parts) == 2 {
			result[string(parts[0])] = string(parts[1])
		}
	}
	return result
}
