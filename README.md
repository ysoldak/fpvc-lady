# Your friendly FPV Combat events announcer

<img src="LadyAnnouncer.jpg" title="The lady is ready" align="center" />

## Wiring

For the application to work with the combat system, you need **HC-12 module** (e.g. Hailege HC-12 433Mhz SI4438 Wireless Transceiver) connected to PC via **USB to UART TTL converter** (e.g. CP2102 MICRO USB to UART TTL Convert Module).  
Optionally, install a separate 433mhz antenna to better reception.

<img src="LadyWiring.jpg" title="Wire your lady correctly" align="center" />

## Usage
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
   --speak value   Text-to-speech command: [system], google, none or any other command to convert text to speech. (default: "system") [$SPEAK]
   --speak-lives   Speak lives. (default: false) [$SPEAK_LIVES]
   --speak-cheers  Speak cheers. (default: false) [$SPEAK_CHEERS]
   --help, -h      show help
   --version, -v   print the version
```

## Administartor panel local web GUI (experimental, under construction)
When the project is cloned, navigate to the web GUI dir first
```
cd \front\
```

Before running the first time, be sure you have [Node.js](https://nodejs.org/en) installed 

And then install the package:

```
npm install
```

If there are any troubles running the project, try doing the automate fixing:

```
npm audit fix
```

#### RUNNING THE PROJECT
You need to open two separate consoles:

Running local API mock (needed just in the dev phase)
```
npm run json-server
```

Running main local webserver
```
npm run start
```

Navigate to the [localhost at port 3000](http://localhost:3000) address using your web-browser to access the web GUI.

### Mac

Macs have male voice by default, use command below to switch to a female voice.
```
fpvc-lady-darwin-amd64-x.x.x --speak "say -v samantha"
```

### Windows

Use PowerShell. You may need to tweak permissions.

### Linux

Good luck!
