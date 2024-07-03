package tts

import (
	"os"
	"os/exec"

	htgotts "github.com/hegedustibor/htgo-tts"
	"github.com/hegedustibor/htgo-tts/voices"
)

type Google struct {
	htgo htgotts.Speech
}

func (tts *Google) Speak(phrase string) {
	tts.htgo.Speak(phrase)
}

func NewGoogle() *Google {
	if commandExists("mplayer") {
		return &Google{
			htgo: htgotts.Speech{Folder: os.TempDir(), Language: voices.English},
		}
	}
	if commandExists("ffplay") {
		return &Google{
			htgo: htgotts.Speech{Folder: os.TempDir(), Language: voices.English, Handler: &FFPlay{}},
		}
	}
	println("Voice Error. For 'google' tts to work, either mplayer or ffmpeg (ffplay) must be installed")
	os.Exit(1)
	return nil
}

type FFPlay struct{}

func (ffp *FFPlay) Play(fileName string) error {
	cmd := exec.Command("ffplay", "-nodisp", "-autoexit", fileName)
	return cmd.Run()
}

func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}
