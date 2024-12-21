Config files
- Config file (in conf file format?) -- create the file on first start from values in binary
- Cheers file, create the file on first start from values in binary
- Dad jokes, create the file on first start from values in binary
- Dead cheers, see https://github.com/ysoldak/fpvc-lady/issues/8
- I18N, by simple use of yet another conf file?

CUI (Console UI)
- Use textbox and refresh screen, see https://github.com/ysoldak/fpvc-lady/issues/2
  - example https://github.com/0xcafed00d/joystick/blob/master/joysticktest/joysticktest.go
- Highlight latest change in table -- color or just bold, highlight whole line perhaps?
- Session restart, see https://github.com/ysoldak/fpvc-lady/issues/3

WebUI
- Start http server on port 8080 (configurable)
  - Show table
  - Button to STOP and START (when stopped)
- Later have full blown nice web interface with all functions

TTS
- Glue Hit and Score messages if possible, see https://github.com/ysoldak/fpvc-lady/issues/7
  - less severe now when we concat phrases under high load
  - needs refactoring so main loop does not depend on message channel --> delay hit in wait for claim and announce hit anyway when no claim came in time
- Cache online tts responses and reuse them
  - Can be hard for a) names, b) concatenated messages
  - Only benefits Linux users -> low prio, but this means Raspberry Pi too -> higher prio
- Investigate if it's possible to increase speech pace, see https://github.com/ysoldak/fpvc-lady/issues/5
  - espeak -s 200
  - playback speed in mplayer and ffplay
  - win???
  - mac???

Serious stuff (Championships, etc)
- Match timer, see https://github.com/ysoldak/fpvc-lady/issues/4
- Sort table according to kills and deaths, with configurable weights
- Different weights for different players? Like static target worth less than a real player
- Adaptable weights based on history? It shall worth more to kill someone who performs better than others historically
