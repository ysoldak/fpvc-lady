import txt from '../locale/locale'
import formatDateTime from './formatDateTime'
import displayMatrix from './hitMatrix'
import lookupPlayer from './lookupPlayer'

export function exportData(full, stats, lang, rows, msgs, hits) {
  let filename = 'fpvcombat_session_'
  filename += stats ? 'stats_' : ''
  filename += hits.length > 0 ? 'hits_' : ''
  filename += new Date().toJSON().slice(0,19).replace('T', '__')
  filename += full ? '__all' : ''
  let type = 'text'
  let data = ''
  if (stats) {
    data += txt('player', lang).substring(0, 16).padEnd(16, ' ') + ' | '
    data += txt('desc', lang).substring(0, 20).padEnd(20, ' ') + ' || '
    data += txt('hits', lang).substring(0, 12).padStart(12, ' ') + ' | '
    data += txt('damage', lang).substring(0, 12).padStart(12, ' ') + ' | '
    data += txt('lives', lang).substring(0, 12).padStart(12, ' ') + ' | '
    data += txt('score', lang).substring(0, 12).padStart(12, ' ') + ' | '
    data += txt('updated', lang).substring(0, 12).padEnd(12, ' ') + ' \n'
    data += '---------------- | -------------------- || ------------ | ------------ | ------------ | ------------ | ---------------------- \n'
    rows.forEach((row) => {
      data += (row.playerName.substring(0, 11) + ' (' + row.playerId + ')').padEnd(16, ' ') + ' | '
      data += row.playerDesc.substring(0, 20).padEnd(20, ' ') + ' || '
      data += row.hits.toString().substring(0, 12).padStart(12, ' ') + ' | '
      data += row.damage.toString().substring(0, 12).padStart(12, ' ') + ' | '
      data += row.lives.toString().substring(0, 12).padStart(12, ' ') + ' | '
      data += row.score.toString().substring(0, 12).padStart(12, ' ') + ' | '
      data += formatDateTime(row.updated.toString()).substring(0, 19).padEnd(22, ' ') + ' \n'
    })
    data += '\n'
    data += txt('totalHits', lang) + ': ' + rows.reduce((total, row) => total += parseInt(row.hits), 0)
  }
  else if (!stats && hits.length > 0 && msgs.length > 0) {
    data = '* * * HIT MATRIX * * *\n\n\n'
    data += displayMatrix(hits, msgs)
    data += '\n\n* * * ' + txt('logHits', lang).toUpperCase() + ' * * *\n\n\n'
    data += hits.map(hit => {
      let retval = ''
      retval += formatDateTime(hit.timestamp) + ': '
      retval += lookupPlayer(hit?.victimId, msgs) + ' (' + hit?.victimId?.toString(16).toUpperCase() + ') '
      retval += txt('logHitsInfo', lang) + ' '
      retval += lookupPlayer(hit?.attackerId, msgs) + ' (' + hit?.attackerId?.toString(16).toUpperCase() + ')'
      return retval
    }).join('\n')
  }
  else if (!stats && msgs.length > 0) {
    data = full ? msgs.map(m => JSON.stringify(m)).join('\n\n') : msgs[0].map(p => JSON.stringify(p)).join('\n')
  }
  var file = new Blob([data], {type: type})
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a")
    var url = URL.createObjectURL(file)
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(function() {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 0) 
  }
}