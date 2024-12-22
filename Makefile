VERSION := $(shell git describe --tags)
LD_FLAGS := -ldflags="-X 'main.Version=$(VERSION)'"

SRC := .
BIN := build/fpvc-lady

clean:
	@rm -rf build
	@mkdir -p build

build-front:
	cd gui && npm install && npm run build

build-darwin-amd64:
	GOOS=darwin GOARCH=amd64 go build $(LD_FLAGS) -o build/fpvc-lady-darwin-amd64-$(VERSION) $(SRC)

build-windows-386:
	GOOS=windows GOARCH=386 go build $(LD_FLAGS) -o build/fpvc-lady-windows-386-$(VERSION).exe $(SRC)

build-windows-amd64:
	GOOS=windows GOARCH=amd64 go build $(LD_FLAGS) -o build/fpvc-lady-windows-amd64-$(VERSION).exe $(SRC)

build-linux-386:
	GOOS=linux GOARCH=386 go build $(LD_FLAGS) -o build/fpvc-lady-linux-386-$(VERSION) $(SRC)

build-linux-amd64:
	GOOS=linux GOARCH=amd64 go build $(LD_FLAGS) -o build/fpvc-lady-linux-amd64-$(VERSION) $(SRC)

build-linux-arm:
	GOOS=linux GOARCH=arm go build $(LD_FLAGS) -o build/fpvc-lady-linux-arm-$(VERSION) $(SRC)

build-linux-arm64:
	GOOS=linux GOARCH=arm64 go build $(LD_FLAGS) -o build/fpvc-lady-linux-arm64-$(VERSION) $(SRC)

build: clean build-front build-darwin-amd64 build-windows-386 build-windows-amd64 build-linux-386 build-linux-amd64 build-linux-arm build-linux-arm64

run:
	go run $(SRC)

# minimal command to start a demo, uses system (win & mac) for tts
demo:
	go run $(SRC) --source demo

# very chatty
demo-heavy-speak:
	go run $(SRC) --source demo --speak-lives --speak-cheers

# use espeak offline tts (available on Linux)
demo-espeak:
	go run $(SRC) --source demo --speak espeak --speak-lives --speak-cheers

# use google online tts
demo-google:
	go run $(SRC) --source demo --speak google --speak-lives --speak-cheers

replay:
	go run $(SRC) --source log --log-file fpvc-lady.log
