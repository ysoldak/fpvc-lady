import lookupPlayer from './lookupPlayer'

export function hitMatrix(hits, msgs) {
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

export function hitMatrixFormatted(matrix, msgs) {
  let orderedIds = []
  let retval = '                | '
  for (let attackerId in matrix) {
    retval += (lookupPlayer(attackerId, msgs) + ' (' + parseInt(attackerId).toString(16).toUpperCase() + ')').substring(0, 16).padEnd(15, ' ') + ' | '
    orderedIds.push(attackerId)
  }
  retval += '\n'
  retval += '------------------'
  // eslint-disable-next-line no-unused-vars
  for (let attackerId in matrix) {
    retval += '------------------'
  }
  retval += '\n'
  for (let attackerId in matrix) {
    retval += (lookupPlayer(attackerId, msgs) + ' (' + parseInt(attackerId).toString(16).toUpperCase() + ')').substring(0, 16).padStart(15, ' ') + ' | '
    for (let i in orderedIds) {
      let val = orderedIds[i] in matrix[attackerId].attacked ? matrix[attackerId].attacked[orderedIds[i]] : 0
      retval += parseInt(attackerId) === parseInt(orderedIds[i]) ? '       -        | ' : val.toString().padStart(15, ' ') + ' | '
    }
    retval += '\n'
  }
  retval += '\n'
  retval += '\n'
  return retval
}

export default function displayMatrix(hits, msgs) {
  if (hits && hits.length > 0) {
    return hitMatrixFormatted(hitMatrix(hits, msgs), msgs)
  }
}