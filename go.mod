module github.com/ysoldak/fpvc-lady

go 1.23

require (
	github.com/gorilla/websocket v1.5.3
	github.com/hegedustibor/htgo-tts v0.0.0-20211106065519-4b33b08f698f
	github.com/urfave/cli/v2 v2.27.2
	go.bug.st/serial v1.6.2
)

require (
	github.com/cpuguy83/go-md2man/v2 v2.0.4 // indirect
	github.com/creack/goselect v0.1.2 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/xrash/smetrics v0.0.0-20240521201337-686a1a2994c1 // indirect
	golang.org/x/sys v0.21.0 // indirect
)

require github.com/ysoldak/fpvc-serial-protocol v1.1.1

// replace github.com/ysoldak/fpvc-serial-protocol => ../fpvc-serial-protocol
