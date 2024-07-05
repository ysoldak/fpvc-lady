package utils

import (
	"errors"
	"io"
	"path/filepath"
	"runtime"
	"strings"

	"go.bug.st/serial"
)

func NewSerial(candidate string) (io.ReadWriter, error) {
	port, err := findSerialPort(candidate)
	if err != nil {
		return nil, err
	}
	serial, err := serial.Open(port, &serial.Mode{
		BaudRate: 9600,
	})
	if err != nil {
		return nil, err
	}
	return serial, nil
}

func findSerialPort(candidate string) (port string, err error) {
	ports := []string{}
	switch runtime.GOOS {
	case "darwin":
		ports, err = searchPaths("/dev/cu.usb*")
	case "linux":
		ports, err = searchPaths("/dev/ttyACM*", "/dev/ttyUSB*")
	case "windows":
		ports, err = serial.GetPortsList()
	}

	if err != nil {
		return "", err
	} else if ports == nil {
		return "", errors.New("unable to locate a serial port")
	} else if len(ports) == 0 {
		return "", errors.New("no serial ports available")
	}

	if candidate == "" {
		if len(ports) == 1 {
			return ports[0], nil
		} else {
			return "", errors.New("multiple serial ports available - use -port flag, available ports are " + strings.Join(ports, ", "))
		}
	}

	for _, p := range ports {
		if p == candidate {
			return p, nil
		}
	}

	return "", errors.New("port you specified '" + candidate + "' does not exist, available ports are " + strings.Join(ports, ", "))
}

// searchPaths supports several path patterns, wraps filepath.Glob that can do only one
func searchPaths(patterns ...string) ([]string, error) {
	result := []string{}
	for _, pattern := range patterns {
		ports, err := filepath.Glob(pattern)
		if err != nil {
			return nil, err
		}
		result = append(result, ports...)
	}
	return result, nil
}
