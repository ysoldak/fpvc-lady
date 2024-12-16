VERSION := $(shell git describe --tags)
LD_FLAGS := -ldflags="-X 'main.Version=$(VERSION)'"

SRC := ./cmd/lady
BIN := build/fpvc-lady

clean:
	@rm -rf build
	@mkdir -p build

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

build: clean build-darwin-amd64 build-windows-386 build-windows-amd64 build-linux-386 build-linux-amd64 build-linux-arm build-linux-arm64

run:
	go run $(SRC)

demo:
	go run $(SRC) --source demo

demo-cheers:
	go run $(SRC) --source demo --speak-cheers=true

replay:
	go run $(SRC) --source file
