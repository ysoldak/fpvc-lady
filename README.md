# Your friendly FPV Combat events announcer

<img src="LadyAnnouncer.jpg" title="The lady is ready" align="center" />

```
NAME:
   fpvc-lady - FPV Combat Events Announcer

USAGE:
   fpvc-lady [global options] command [command options] 

VERSION:
   0.0.0

COMMANDS:
   help, h  Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --port value    Port name where HC12 is connected to. (default: "auto") [$PORT]
   --speech value  Speech command: [system], google, none or any other command to convert text to speech. (default: "system") [$SPEECH]
   --help, -h      show help
   --version, -v   print the version
```

### Mac

Macs have male voice by default, use command below to switch to a female voice.
```
fpvc-lady-darwin-amd64-x.x.x --speech "say -v samantha"
```

### Windows

Use PowerShell. You may need to tweak permissions.

### Linux

Good luck!
