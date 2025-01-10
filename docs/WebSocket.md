# WebSocket Communication

_Values in all messages are only for example._  

For simplicity:  
**Request** -- message from frontend to backend.  
**Response** -- message from backend to frontend.

"type" field defines type of payload (if not empty) or type of request.  
"seq" field is preserved by backend when responding to a request -- this is to help frontend tell messages apart.  
"payload" field represents either game session or configuration, empty or omitted payload means data is requested rather than provided.  

## Session

Game/combat session.

Stopping a session means the system stops listening to events.  
Note the events may still happen, combat may still be ongoing and events are sent, it's just our system ignores them.  
Stopping a session does not cleanup it's state, just marks it inacive -- so frontend can always request status again.

Upon start, state of the session is cleaned: all hits, damage and scores are erased. Player registrations are erased too.  
Note: Stopping a session mid-fight and starting it again results in blank table, no names will be shown, only IDs, since no beacons are send during active fight.

### Status update
Session status update (backend pushes w/o explicit request from frontend), note empty "seq" value.
```
{
  "payload" : {
    "active" : true,
    "players" : [
      {
        "Lives" : 49,
        "ID" : 161,
        "Description" : "2.8.0 2.6           ",
        "Updated" : "2025-01-10T22:47:03.922416+01:00",
        "Damage" : 1,
        "Name" : "ALPHA     ",
        "Hits" : 0,
        "Value" : 0
      },
      {
        "Lives" : 99,
        "ID" : 179,
        "Description" : "2.8.0 2.5           ",
        "Updated" : "2025-01-10T22:46:57.820151+01:00",
        "Damage" : 1,
        "Name" : "BRAVO     ",
        "Hits" : 0,
        "Value" : 0
      },
      {
        "Lives" : 149,
        "ID" : 197,
        "Description" : "2.8.0 2.6           ",
        "Updated" : "2025-01-10T22:47:08.022816+01:00",
        "Damage" : 1,
        "Name" : "CHARLIE   ",
        "Hits" : 2,
        "Value" : 0
      },
      {
        "Lives" : 249,
        "ID" : 212,
        "Description" : "2.8.0 2.6           ",
        "Updated" : "2025-01-10T22:47:08.122942+01:00",
        "Damage" : 1,
        "Name" : "DELTA     ",
        "Hits" : 2,
        "Value" : 0
      }
    ]
  },
  "type" : "session",
  "seq" : ""
}
```

### Status request & response

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
  "payload" : {
    "active" : true,
    "players" : [
      {
        "Lives" : 49,
        "ID" : 161,
        "Description" : "2.8.0 2.6           ",
        "Updated" : "2025-01-10T22:47:03.922416+01:00",
        "Damage" : 1,
        "Name" : "ALPHA     ",
        "Hits" : 0,
        "Value" : 0
      },
      {
        "Lives" : 99,
        "ID" : 179,
        "Description" : "2.8.0 2.5           ",
        "Updated" : "2025-01-10T22:46:57.820151+01:00",
        "Damage" : 1,
        "Name" : "BRAVO     ",
        "Hits" : 0,
        "Value" : 0
      },
      {
        "Lives" : 149,
        "ID" : 197,
        "Description" : "2.8.0 2.6           ",
        "Updated" : "2025-01-10T22:47:08.022816+01:00",
        "Damage" : 1,
        "Name" : "CHARLIE   ",
        "Hits" : 2,
        "Value" : 0
      },
      {
        "Lives" : 249,
        "ID" : 212,
        "Description" : "2.8.0 2.6           ",
        "Updated" : "2025-01-10T22:47:08.122942+01:00",
        "Damage" : 1,
        "Name" : "DELTA     ",
        "Hits" : 2,
        "Value" : 0
      }
    ]
  },
  "type" : "session",
  "seq" : "112233"
}
```

### Start
Request  
_all content in payload but "active" field is ignored_
```
{
	"type": "session",
	"seq": "1",
	"payload": {
		"active": true
	}
}
```

Response  
_skipped, same long response as above_

### Stop
Request  
_all content in payload but "active" field is ignored_
```
{
	"type": "session",
	"seq": "1",
	"payload": {
		"active": false
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
  "payload" : {
    "locale" : "en",
    "logSocket": "",
    "speakCommand" : "system",
    "speakCheers" : false,
    "speakLives" : false
  },
  "type" : "config",
  "seq" : "1"
}
```

### Set config
Request 
```
{
  "payload" : {
    "locale" : "ru",
    "logSocket": "fpvc-lady.socket.log",
    "speakCommand" : "say -v Milena",
    "speakCheers" : false,
    "speakLives" : false
  },
  "type" : "config",
  "seq" : "123"
}
```

Response
```
{
  "payload" : {
    "locale" : "ru",
    "logSocket": "fpvc-lady.socket.log",
    "speakCommand" : "say -v Milena",
    "speakCheers" : false,
    "speakLives" : false
  },
  "type" : "config",
  "seq" : "123"
}
```
