import txt from '../locale/locale'

export const roundTimeMarks = [
  { value: 0, label: '0' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
]

export const countDownMarks = (lang) =>  [
  { value: 0, label: '0 ' + txt('sec', lang) },
  { value: 5, label: '5 ' + txt('sec', lang) },
  { value: 10, label: '10 ' + txt('sec', lang) },
  { value: 30, label: '30 ' + txt('sec', lang) },
  { value: 60, label: '1 ' + txt('min', lang) },
]

export const ladyLocales = [
  { label: '[en] English', value: 'en' },
  { label: '[de] Deutsch', value: 'de' },
  { label: '[pl] Polski', value: 'pl' },
  { label: '[ua] Українська', value: 'ua' },
]

