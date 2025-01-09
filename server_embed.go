package main

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed build/front/*
var static embed.FS

func handleStatic() {
	contentStatic, _ := fs.Sub(static, "build/front")
	http.Handle("/", http.FileServer(http.FS(contentStatic)))
}
