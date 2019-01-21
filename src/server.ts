import ParcelBundler from 'parcel-bundler'
import express from 'express'
import { Server } from 'http'
import socketIo from 'socket.io'
import { CLIENT_COMMAND, Command, CommandState } from './game/protocol'

const app = express()

const bundler = new ParcelBundler('src/index.html', {})

const server = new Server(app)

const io = socketIo(server)

app.use((bundler as any).middleware())

server.listen(1234)

console.log('Listening for connections @ 1234')

const clientConnections: { [key: string]: SocketIO.Socket } = {}

io.on('connection', socket => {
  console.log('Client connected: ', socket.id)
  clientConnections[socket.id] = socket

  socket.on(CLIENT_COMMAND, (command: Command, state: CommandState) => {
    Object.entries(clientConnections).forEach(([, connection]) => {
      connection.emit(CLIENT_COMMAND, command, state)
    })
  })

  socket.once('disconnect', () => {
    console.log('Client disconnected: ', socket.id)
    delete clientConnections[socket.id]
  })
})
