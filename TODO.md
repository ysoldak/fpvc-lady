# TODO

## Config files
- Config file (in conf file format?) -- create the file on first start from values in binary and passed command-line flags
- Dad jokes, create the file on first start from values in binary
- Dead cheers, see https://github.com/ysoldak/fpvc-lady/issues/8

## WebUI
- Full blown nice web interface with all functions

## TTS
- Cache online tts responses and reuse them
  - Can be hard for a) names, b) concatenated messages
  - Only benefits Linux users -> low prio, but this means Raspberry Pi too -> higher prio
- Investigate if it's possible to increase speech pace, see https://github.com/ysoldak/fpvc-lady/issues/5
  - espeak -s 200
  - playback speed in mplayer and ffplay
  - win???
  - mac???

## Serious stuff (Championships, etc)
- Match timer, see https://github.com/ysoldak/fpvc-lady/issues/4
- Sort table according to kills and deaths, with configurable weights
- Different weights for different players? Like static target worth less than a real player
- Adaptable weights based on history? It shall worth more to kill someone who performs better than others historically


# Implemented

## CUI (Console UI)
- Using tcell https://github.com/gdamore/tcell
- Highlight latest change in table, both attacker and victim with "->"
- Session restart (start/stop by pressing Spacebar), see https://github.com/ysoldak/fpvc-lady/issues/3

## Config files
- Cheers file, create the file on first start from values in binary, in "locale" folder
- I18N/L10N, same approach as cheers.

## WebUI
- Start http server on port 8080 (configurable)
  - Show table
  - Button to STOP and START (when stopped)

## TTS
- Hit and Score messages are glued
- System drops phrases of less priority under high load
