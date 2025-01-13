package main

import (
	"bytes"
	"math/rand"
	"os"
	"strings"
)

type Locale struct {
	comments map[string]string
	labels   map[string]string
	cheers   []string
}

func NewLocale(id string) *Locale {
	cheersFile := localeDir + "/cheers.en.txt"
	commentsFile := localeDir + "/comments.en.txt"
	labelsFile := localeDir + "/labels.en.txt"

	locale := &Locale{
		comments: fileToMap(commentsFile),
		labels:   fileToMap(labelsFile),
		cheers:   fileToSlice(cheersFile),
	}

	if id != "en" {
		files, err := os.ReadDir(localeDir)
		if err != nil {
			panic(err)
		}
		for _, file := range files {
			if file.Name() == "comments."+id+".txt" {
				commentsFile = localeDir + "/" + file.Name()
				locale.comments = mergeMaps(locale.comments, fileToMap(commentsFile))
			} else if file.Name() == "labels."+id+".txt" {
				labelsFile = localeDir + "/" + file.Name()
				locale.labels = mergeMaps(locale.labels, fileToMap(labelsFile))
			} else if file.Name() == "cheers."+id+".txt" {
				cheersFile = localeDir + "/" + file.Name()
				locale.cheers = fileToSlice(cheersFile)
			}
		}
	}

	return locale
}

func (l *Locale) Comment(id string) string {
	return l.comments[id]
}

func (l *Locale) Label(id string) string {
	return l.labels[id]
}

func (l *Locale) RandomCheer() string {
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

func mergeMaps(a, b map[string]string) map[string]string {
	result := make(map[string]string)
	for k, v := range a {
		result[k] = v
	}
	for k, v := range b {
		result[k] = v
	}
	return result
}
