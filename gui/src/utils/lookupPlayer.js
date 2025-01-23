function lookupPlayer(id, msgs) {
  let retval = ''
  if (msgs && msgs.length > 0) {
    msgs[0].map((player) => {
      if (id && player.id.toString() === id.toString()) {
        retval = player.name
      }
      return ''
    })
  }
  return retval
}

export default lookupPlayer