package tts

import (
	"runtime"
)

func NewSystem() TtsBackend {
	switch {
	case runtime.GOOS == "windows":
		return &Windows{}
	case runtime.GOOS == "darwin":
		return &Custom{executable: "say"}
	case runtime.GOOS == "linux":
		return &None{}
	}
	return nil
}
