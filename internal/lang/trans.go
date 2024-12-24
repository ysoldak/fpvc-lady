package lang

type Translation struct {
	Speech map[string]string // messages
	Cheers []string          // cheers
}

type Translations map[string]Translation

var Trans Translations = make(Translations)
