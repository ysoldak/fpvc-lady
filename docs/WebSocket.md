# WebSocket Communication

_Values in all messages are only for example._  

For simplicity:  
**Request** -- message from frontend to backend.  
**Response** -- message from backend to frontend.

"type" field defines type of payload (if not empty) or type of request.  
"seq" field is preserved by backend when responding to a request -- this is to help frontend tell messages apart.  
"payload" field represents either game session or configuration, empty or omitted payload means data is requested rather than provided.  

## Session

A session consists of four phases: Registration, Countdown, Battle and End.  
Only one of phases can be active any given time.  
The system advances from one phase to another in the natural order (see above).  
Advancement can happen automatically (battle starts when first hit is registered / battle ends when battle duration elapses) or manually by pressing "Space" button or via Web UI.  

There are four timestamps in session status to denote active phase:

- Registration Started (RS)
- Registration Ended (RE)
- Battle Started (BS)
- Battle Ended (BE)

```
RS | RE | BS | BE | Active phase
------------------------------------------
 + |  - |  - |  - | Registration
 + |  + |  - |  - | Countdown
 + |  + |  + |  - | Battle
 + |  + |  + |  + | End
```

_Any other timestamp combination is invalid._  

**Registration** phase is active on application launch, it's time for models to register and for system listens to their beacons and constructs a roster.  
Registration pahse can end automatically upon receiving a hit message if battle auto-start is contigured (see `--auto-start`), otherwise press "Space" or advance via Web UI.

**Countdown** phase is a transitional short-living phase between Registration and Battle phases, the system counts down aloud pre-configured number of seconds, then session advances to Battle automatically.  
Countdown phase is hopped over / skipped when `--auto-start=true` or `--duration-countdown=0`.

**Battle** phase is then hit and claim messages are handled, points calculated.  
Battle phase can be time-limited or not, this depends on value of `--duration-battle`.  
When the Battle phase is time-limited:
- time remaining is announced every minute;
- last 10 seconds are announced;
- battle phase automatically ends and session transitions to End phase.

**End** phase is the final phase of a battle session, after this session can only be restarted by pressing `R` button or via Web UI.  
During End phase all combat events are ignored, no points are awarded anymore.  
Note the events may still happen, combat may still be ongoing and events are sent, it's just the system ignores them.  
Ending a session does not cleanup it's state, just becomes inacive -- and frontend can always request status again.

Upon **restart**, state of the session is cleaned: all hits, damage and scores are erased. Player registrations are erased too.  
Note: Restarting a session mid-fight results in blank roster table, no names will be shown, only IDs, since no beacons are send during active fight.

### Session Status Update
Session status update (backend pushes w/o explicit request from frontend), note empty "seq" value.
```
{
  "payload": {
    "active": true,
    "players": [
      {
        "score": -1,
        "lives": 49,
        "id": 161,
        "description": "2.8.0 2.6",
        "updated": "2025-01-10T22:47:03.922416+01:00",
        "damage": 1,
        "name": "ALPHA",
        "hits": 0
      },
      {
        "score": -1,
        "lives": 99,
        "id": 179,
        "description": "2.8.0 2.5",
        "updated": "2025-01-10T22:46:57.820151+01:00",
        "damage": 1,
        "name": "BRAVO",
        "hits": 0
      },
      {
        "score": 5,
        "lives": 149,
        "id": 197,
        "description": "2.8.0 2.6",
        "updated": "2025-01-10T22:47:08.022816+01:00",
        "damage": 1,
        "name": "CHARLIE",
        "hits": 2
      },
      {
        "score": 5,
        "lives": 249,
        "id": 212,
        "description": "2.8.0 2.6",
        "updated": "2025-01-10T22:47:08.122942+01:00",
        "damage": 1,
        "name": "DELTA",
        "hits": 2
      }
    ],
    "hits": [
      {
        "victimId": 179,
        "attackerId": 197,
        "timestamp": "2025-01-10T22:47:08.122942+01:00"
      },
      ...
    ],
    "timestamps": {
      "batEnded": "0001-01-01T00:00:00Z",
      "regStarted": "2025-01-22T13:34:48.088056+01:00",
      "regEnded": "2025-01-22T13:35:04.115781+01:00",
      "batStarted": "2025-01-22T13:35:05.094725+01:00"
    }
  },
  "type": "session",
  "seq": "",
  "error": ""
}
```

### Session Status Request & Response

Request  
_note "seq" value_
```
{
	"type": "session",
	"seq": "112233",
	"payload": null
}
```

Response  
_note "seq" value is the same as in request_
```
{
  "payload": {
    "active": true,
    "players": [
      {
        "score": -1,
        "lives": 49,
        "id": 161,
        "description": "2.8.0 2.6",
        "updated": "2025-01-10T22:47:03.922416+01:00",
        "damage": 1,
        "name": "ALPHA",
        "hits": 0
      },
      {
        "score": -1,
        "lives": 99,
        "id": 179,
        "description": "2.8.0 2.5",
        "updated": "2025-01-10T22:46:57.820151+01:00",
        "damage": 1,
        "name": "BRAVO",
        "hits": 0
      },
      {
        "score": 5,
        "lives": 149,
        "id": 197,
        "description": "2.8.0 2.6",
        "updated": "2025-01-10T22:47:08.022816+01:00",
        "damage": 1,
        "name": "CHARLIE",
        "hits": 2
      },
      {
        "score": 5,
        "lives": 249,
        "id": 212,
        "description": "2.8.0 2.6",
        "updated": "2025-01-10T22:47:08.122942+01:00",
        "damage": 1,
        "name": "DELTA",
        "hits": 2
      }
    ],
    "hits": [
      {
        "victimId": 179,
        "attackerId": 197,
        "timestamp": "2025-01-10T22:47:08.122942+01:00"
      },
      ...
    ],
    "timestamps": {
      "batEnded": "0001-01-01T00:00:00Z",
      "regStarted": "2025-01-22T13:34:48.088056+01:00",
      "regEnded": "2025-01-22T13:35:04.115781+01:00",
      "batStarted": "2025-01-22T13:35:05.094725+01:00"
    }
  },
  "type": "session",
  "seq": "112233",
  "error": ""
}
```

### End Registration
Transition to the countdown phase achieved by ending/closing registration, the battle either starts immediately or after a countdown.  
While the system is in countdown state, "batStarted" is zeroed.  
Request  
_all content in payload but "phases" field is ignored_
```
{
  "type": "session",
  "seq": "1",
  "payload": {
    "timestamps": {
      "regEnded": "2025-01-22T13:35:04.115781+01:00",
    }
  }
}
```

Response  
_skipped, same long response as above_

### End Battle
Ending battle ends the session, it can only be restarted after that, with all stats wiped.  
Request  
_all content in payload but "phases" field is ignored_
```
{
  "type": "session",
  "seq": "1",
  "payload": {
    "timestamps": {
      "batEnded": "2025-01-22T13:35:04.115781+01:00"
    }
  }
}
```

Response  
_skipped, same long response as above_

### Restart Session
Restarting a session wipes all stats, achieved by resetting all timestamps and initiating registration.  
Request  
_all content in payload but "phases" field is ignored_
```
{
  "type": "session",
  "seq": "1",
  "payload": {
    "timestamps": {
      "regStarted": "2025-01-22T13:34:48.088056+01:00",
      "regEnded": "0001-01-01T00:00:00Z",
      "batStarted": "0001-01-01T00:00:00Z",
      "batEnded": "0001-01-01T00:00:00Z"
    }
  }
}
```

Response  
_skipped, same long response as above_


## Config

A subset of system configuration -- things that can be changed live. More may be added later.

### Get config
Request
```
{
	"type": "config",
	"seq": "1",
	"payload": null
}
```

Response
```
{
  "payload": {
    "locale": "en",
    "logSocket": "",
    "scoreHits": "A1-E9:3,F1-FF:1",
    "scoreDamages": "-1",
    "speakCommand": "system",
    "speakCheers": false,
    "speakLives": false,
    "autoStart": false,
    "durationBattle": 5,
    "durationCountdown": 10
  },
  "type": "config",
  "seq": "1"
}
```

### Set config
Request 
```
{
  "payload": {
    "locale": "ru",
    "logSocket": "fpvc-lady.socket.log",
    "scoreHits": "A1-E9:3,F1-FF:1",
    "scoreDamages": "-1",
    "speakCommand": "say -v Milena",
    "speakCheers": false,
    "speakLives": false,
    "autoStart": false,
    "durationBattle": 5,
    "durationCountdown": 10
  },
  "type": "config",
  "seq": "123"
}
```

Response
```
{
  "payload": {
    "locale": "ru",
    "logSocket": "fpvc-lady.socket.log",
    "scoreHits": "A1-E9:3,F1-FF:1",
    "scoreDamages": "-1",
    "speakCommand": "say -v Milena",
    "speakCheers": false,
    "speakLives": false,
    "autoStart": false,
    "durationBattle": 5,
    "durationCountdown": 10
  },
  "type": "config",
  "seq": "123"
}
```
