import txtDe from './text/de-DE.json'
import txtEn from './text/en-EN.json'
import txtPL from './text/pl-PL.json'

const langs = {
  de: { name: 'Deutsch', text: txtDe },
  en: { name: 'English', text: txtEn },
  pl: { name: 'Polski', text: txtPL },
}

function txt(label, lang) {
  if (langs.hasOwnProperty(lang) && langs[lang].text.hasOwnProperty(label)) {
    return langs[lang].text[label]
  }
  else if (langs.hasOwnProperty(lang) && !langs[lang].text.hasOwnProperty(label) && langs.en.text.hasOwnProperty(label)) {
    return langs.en.text[label]
  }
  else {
    return label
  }

}

export { langs, txt }

export default txt