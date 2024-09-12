# Your friendly FPV Combat events announcer

<img src="LadyAnnouncer.jpg" title="The lady is ready" align="center" />

```
NAME:
   fpvc-lady - FPV Combat Events Announcer

USAGE:
   fpvc-lady [global options] command [command options]

HARDWARE:
   - USB to UART TTL converter (e.g. CP2102 MICRO USB to UART TTL Convert Module)
   - HC12 Module (e.g. Hailege HC-12 433Mhz SI4438 Wireless Transceiver)
   - optional: separate 433mhz antenna 
![image](https://github.com/user-attachments/assets/9264b201-9b36-4aaf-a082-b80fef141d8e)

VERSION:
   0.0.0

COMMANDS:
   help, h  Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --port value    Port name where HC12 is connected to. (default: "auto") [$PORT]
   --speak value   Text-to-speech command: [system], google, none or any other command to convert text to speech. (default: "system") [$SPEAK]
   --speak-lives   Speak lives. (default: false) [$SPEAK_LIVES]
   --speak-cheers  Speak cheers. (default: false) [$SPEAK_CHEERS]
   --help, -h      show help
   --version, -v   print the version
```

When `--speak=google`, must have `mplayer` or `ffplay` installed.  

### Mac

Macs have male voice by default, use command below to switch to a female voice.
```
fpvc-lady-darwin-amd64-x.x.x --speak "say -v samantha"
```

### Windows

Use PowerShell. You may need to tweak permissions.

### Linux

Good luck!
