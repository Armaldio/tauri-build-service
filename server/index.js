const http = require('http')
const express = require('express')
const { ready } = require('consola')
const { Nuxt, Builder } = require('nuxt')
const bodyParser = require('body-parser')
const SocketIO = require('socket.io')
const config = require('../nuxt.config.js')
const api = require('./socket-api')
const download = require('./download')

// Import and Set Nuxt.js options
const app = express()
const server = http.createServer(app)
const io = SocketIO(server)

app.use(bodyParser.json())
app.get('/download', download)

const dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  server.listen(port, host)

  io.on('connection', (socket) => {
    api(socket)
  })

  ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
