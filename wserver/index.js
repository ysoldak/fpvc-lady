const { WebSocketServer } = require("ws")
const http = require("http")
const url = require("url")

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

const port = 3003
const connections = {}
const users = {}

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString())
  const user = (users[uuid] && users[uuid] !== undefined ? users[uuid] : 'default_user')
  user.state = message
  broadcast()
  console.log(
    `${user.username} updated their updated state: ${JSON.stringify(
      user.state,
    )}`,
  )
}

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`)
  delete connections[uuid]
  delete users[uuid]
  broadcast()
}

const broadcast = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid]
    const message = JSON.stringify(users)
    connection.send(message)
  })
}

const randomInterval = () => {
  return Math.floor(Math.random() * 7500)
}

const currentTimestamp = () => {
  var d = new Date();
  var months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
  return (`${d.getFullYear()}-${months[d.getMonth()]}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`)
}

let table
let randomOutputsRunning = false
function randomOutputs() {
  if (randomOutputsRunning) {
    Object.keys(connections).forEach((uuid) => { handleMessage(JSON.stringify({"table": table}), uuid) })
    return
  }
  randomOutputsRunning = true
  // Example player 1
  setTimeout(() => {
    table = []
    table.push({
      ID: "A1",
      name: "Alice",
      description: "fake fake fake",
      updated: currentTimestamp(),
      kills: 0,
      deaths: 0,
      lives: 99
    })
    Object.keys(connections).forEach((uuid) => { handleMessage(JSON.stringify({"table": table}), uuid) })
    // Example player 2
    setTimeout(() => {
      if (table) {
        table.push({
          ID: "B1",
          name: "Bob",
          description: "fake fake fake",
          updated: currentTimestamp(),
          kills: 0,
          deaths: 0,
          lives: 99
        })
        Object.keys(connections).forEach((uuid) => { handleMessage(JSON.stringify({"table": table}), uuid) })
      }
    }, randomInterval())
    // Example hits
    let maxTestMsgs = 18
    let startTestMsg = 0
    let intVal = setInterval(() => {
      if (table && table.length > 0) {
        let killer = Math.floor(Math.random() * 2)
        let victim = killer == 0 ? 1 : 0
        if (table[killer] && table[victim]) {
          table[killer].kills++
          table[victim].deaths++
          table[victim].lives--
          table[killer].updated = currentTimestamp()
          table[victim].updated = currentTimestamp()
        }
        Object.keys(connections).forEach((uuid) => { handleMessage(JSON.stringify({"table": table}), uuid) })
      }
      startTestMsg++;
      if (startTestMsg >= maxTestMsgs) {
        clearInterval(intVal)
        randomOutputsRunning = false
      }
    }, randomInterval() + (startTestMsg === 0 ? 10000 : 0))
  }, randomInterval())
}

wsServer.on("connection", (connection, request) => {
  const { uuid } = url.parse(request.url, true).query
  console.log(`${uuid} connected`)
  startTestMsg = 0;
  connections[uuid] = connection
  users[uuid] = {
    username: uuid,
    state: {},
  }
  connection.on("message", (message) => handleMessage(message, uuid))
  connection.on("close", () => handleClose(uuid))
  randomOutputs()
})

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`)
})