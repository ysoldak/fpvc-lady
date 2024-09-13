import txtDe from './text/de-DE.json'
import txtEn from './text/en-EN.json'
import txtPL from './text/pl-PL.json'

const langs = {
  de: txtDe,
  en: txtEn,
  pl: txtPL,
}

function txt(label, lang) {
  if (langs.hasOwnProperty(lang) && langs[lang].hasOwnProperty(label)) {
    return langs[lang][label]
  }
  else if (langs.hasOwnProperty(lang) && !lang[lang].hasOwnProperty(label) && lang.en.hasOwnProperty(label)) {
    return langs.en[label]
  }
  else {
    return label
  }

}

export default txt