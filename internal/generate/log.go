package generate

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	csp "github.com/ysoldak/fpvc-serial-protocol"
)

type Log struct {
	path string
	from time.Time
}

func NewLog(path string, fromString string) *Log {
	fromTime := time.Time{}
	if fromString != "" {
		pattern := "2006/01/02"
		if strings.Contains(fromString, " ") {
			pattern += " 15:04:05"
		}
		if strings.Contains(fromString, ".") {
			pattern += ".000000"
		}
		var err error
		fromTime, err = time.Parse(pattern, fromString)
		if err != nil {
			fmt.Println("Error parsing time:", err)
			fromTime = time.Time{}
		}
	}
	return &Log{
		path: path,
		from: fromTime,
	}
}

// Delays are inserted between messages to simulate real-time data flow.
func (f *Log) Generate(output chan csp.Message) {

	file, err := os.Open(f.path)
	if err != nil {
		fmt.Println("Error opening file:", err)
		close(output)
		return
	}
	defer file.Close()

	tsLast := time.Time{}

	stop := false
	readBattleMessage := false
	scanner := bufio.NewScanner(file)
	for scanner.Scan() && !stop {
		line := scanner.Text()

		if len(line) == 0 {
			stop = readBattleMessage // exit if read at least one battle message before this, means this line potentially starts a new session
			continue
		}

		parts := strings.SplitN(line, " ", 5)
		tsCurr, err := time.Parse("2006/01/02 15:04:05.000000 ", parts[0]+" "+parts[1])
		if err != nil {
			println(err.Error())
			continue
		}

		if !f.from.IsZero() && tsCurr.Before(f.from) {
			continue
		}

		if !tsLast.IsZero() {
			tDiff := tsCurr.Sub(tsLast)
			time.Sleep(tDiff)
		}

		tsLast = tsCurr

		if len(parts) < 4 { // YYYY/MM/DD HH:mm:SS.SSSSSS COMND ID DATA...
			continue
		}

		id, err := strconv.ParseUint(parts[3], 16, 8)
		if err != nil {
			continue
		}

		var message *csp.Message
		cmd := parts[2]
		switch {
		case cmd == "BEACN":
			message = csp.NewBeacon(byte(id), parts[4][0:10], parts[4][11:31]).Message()
			readBattleMessage = true
		case cmd == "DAMAG":
			value, err := strconv.ParseUint(parts[4], 10, 8)
			if err != nil {
				continue
			}
			message = csp.NewHitRequest(byte(id), byte(value)).Message()
			readBattleMessage = true
		case cmd == "CLAIM":
			message = csp.NewHitResponse(byte(id), byte(1)).Message()
			readBattleMessage = true
		}

		if message == nil {
			continue
		}
		output <- *message
	}

	close(output)

}
