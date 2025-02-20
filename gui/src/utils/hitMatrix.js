import lookupPlayer from './lookupPlayer'

function hitMatrix(hits, msgs) {
  let matrix = {}
  msgs[0].forEach((msg, i) => {
    if (!(msg.id in matrix)) {
      matrix[msg.id] = { attacked: {} }
    }
  })
  hits.forEach(hit => {
    if (hit.attackerId && hit.victimId) {
      let attackerId = hit.attackerId
      let victimId = hit.victimId
      if (!(attackerId in matrix)) {
        matrix[attackerId] = { attacked: {} }
      }
      if (!(victimId in matrix)) {
        matrix[victimId] = { attacked: {} }
      }
      if (!(victimId in matrix[attackerId].attacked)) {
        matrix[attackerId].attacked[victimId] = 0
      }
      matrix[attackerId].attacked[victimId]++
    }
  })
  return matrix
}

function hitMatrixFormatted(matrix, msgs, tableRows=false) {
  let orderedIds = []
  let retvalRows = []
  let topRow = {playersCol: ''}
  let retvalStr = '                | '
  for (let attackerId in matrix) {
    retvalStr += (lookupPlayer(attackerId, msgs) + ' (' + parseInt(attackerId).toString(16).toUpperCase() + ')').substring(0, 16).padEnd(15, ' ') + ' | '
    topRow[attackerId] = lookupPlayer(attackerId, msgs) + ' (' + parseInt(attackerId).toString(16).toUpperCase() + ')'
    orderedIds.push(attackerId)
  }
  retvalRows.push(topRow)
  retvalStr += '\n'
  retvalStr += '------------------'
  // eslint-disable-next-line no-unused-vars
  for (let attackerId in matrix) {
    retvalStr += '------------------'
  }
  retvalStr += '\n'
  for (let attackerId in matrix) {
    let nextRow = {playersCol: lookupPlayer(attackerId, msgs) + ' (' + parseInt(attackerId).toString(16).toUpperCase() + ')'}
    retvalStr += (lookupPlayer(attackerId, msgs) + ' (' + parseInt(attackerId).toString(16).toUpperCase() + ')').substring(0, 16).padStart(15, ' ') + ' | '
    for (let i in orderedIds) {
      let val = orderedIds[i] in matrix[attackerId].attacked ? matrix[attackerId].attacked[orderedIds[i]] : 0
      retvalStr += parseInt(attackerId) === parseInt(orderedIds[i]) ? '       -        | ' : val.toString().padStart(15, ' ') + ' | '
      nextRow[orderedIds[i]] = parseInt(attackerId) === parseInt(orderedIds[i]) ? null : val.toString()
    }
    retvalRows.push(nextRow)
    retvalStr += '\n'
  }
  retvalStr += '\n'
  retvalStr += '\n'
  return tableRows ? retvalRows : retvalStr
}

export default function displayMatrix(hits, msgs, tableRows=false) {
  if (hits && hits.length > 0) {
    return hitMatrixFormatted(hitMatrix(hits, msgs), msgs, tableRows)
  }
}