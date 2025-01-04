package main

import (
	"embed"
	"os"
)

//go:embed lang/*
var langFS embed.FS

// extract embeded files
func init() {
	err := os.MkdirAll("lang", 0755)
	if err != nil {
		panic(err)
	}
	efiles, err := langFS.ReadDir("lang")
	if err != nil {
		panic(err)
	}
	for _, efile := range efiles {
		if efile.IsDir() {
			continue
		}
		data, err := langFS.ReadFile("lang/" + efile.Name())
		if err != nil {
			panic(err)
		}
		err = os.WriteFile("lang/"+efile.Name(), data, 0644)
		if err != nil {
			panic(err)
		}
	}
}
