package main

import (
	"crypto/md5"
	"crypto/sha256"
	"embed"
	"fmt"
	"os"
)

const localeDir = "locale"

//go:embed locale/*
var localeFS embed.FS

// extract embeded files
func init() {
	err := os.MkdirAll(localeDir, 0755)
	if err != nil {
		panic(err)
	}
	efiles, err := localeFS.ReadDir(localeDir)
	if err != nil {
		panic(err)
	}
	for _, efile := range efiles {
		if efile.IsDir() {
			continue
		}
		data, err := localeFS.ReadFile(localeDir + "/" + efile.Name())
		if err != nil {
			panic(err)
		}

		// when target file exists
		if _, err := os.Stat(localeDir + "/" + efile.Name()); err == nil {
			hashSha := fmt.Sprintf("%x", sha256.Sum256(data))
			hashMd5 := fmt.Sprintf("%x", md5.Sum(data))

			data2, err := os.ReadFile(localeDir + "/" + efile.Name())
			if err != nil {
				panic(err)
			}
			hashSha2 := fmt.Sprintf("%x", sha256.Sum256(data2))
			hashMd52 := fmt.Sprintf("%x", md5.Sum(data2))

			if hashSha != hashSha2 || hashMd5 != hashMd52 { // backup modified file
				os.Rename(localeDir+"/"+efile.Name(), localeDir+"/"+efile.Name()+".bak")
			} else {
				continue // files are identical, skip unnecessary write in the next block
			}
		}

		// create file copy
		err = os.WriteFile(localeDir+"/"+efile.Name(), data, 0644)
		if err != nil {
			panic(err)
		}
	}
}
