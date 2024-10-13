const { WebSocketServer } = require("ws")
const http = require("http")
const uuidv4 = require("uuid").v4
const url = require("url")

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

const port = 3003
const connections = {}
const users = {}

const maxTestMsgs = 20
let startTestMsg = 1

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

wsServer.on("connection", (connection, request) => {
  const { username } = url.parse(request.url, true).query
  console.log(`${username} connected`)
  startTestMsg = 0;
  const uuid = 'testUUID'; //uuidv4()
  connections[uuid] = connection
  users[uuid] = {
    username,
    state: {},
  }
  connection.on("message", (message) => handleMessage(message, uuid))
  connection.on("close", () => handleClose(uuid))
  let intVal = setInterval(() => {
    var d = new Date();
    var months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    handleMessage(`{"test_msg": "${d.getFullYear()}/${months[d.getMonth()]}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()} TEST MESSAGE"}`, uuid)
    startTestMsg++;
    if (startTestMsg >= maxTestMsgs) {
      clearInterval(intVal)
    }
  }, 1500)
})

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`)
})