import * as React from 'react'
import * as io from 'socket.io-client'
import Stats from 'stats-js'
import { Key } from '~/game/input'
import { createGame, GameInstance } from '~/game/game'
import {
  CLIENT_COMMAND,
  Command,
  CLIENT_REPORT,
  CLIENT_STATUS,
  CommandState
} from './game/protocol'

type Socket = SocketIOClient.Socket
const stats = new Stats()
stats.showPanel(0)

function connect(host: string, port: number): Socket {
  const socketUrl = [host, port].join(':')
  const socket = io.connect(socketUrl)
  return socket
}

function setupProtocol(socket: Socket): Socket {
  socket.on(CLIENT_REPORT, () => {
    socket.emit(CLIENT_STATUS, {
      browser: navigator.appName,
      width: window.innerWidth,
      height: window.innerHeight
    })
  })
  return socket
}
export default class Main extends React.Component {
  rootNode = React.createRef<HTMLDivElement>()
  fpsCounter = React.createRef<HTMLDivElement>()
  game: GameInstance | undefined
  socket: SocketIOClient.Socket | undefined

  componentDidMount() {
    const game = createGame()
    this.rootNode.current!.appendChild(game.canvas)
    this.fpsCounter.current!.appendChild(stats.dom)

    const socket = setupProtocol(
      connect(
        location.hostname,
        1234
      )
    )

    socket.on(CLIENT_COMMAND, game.handleCommand)

    const animate = () => {
      if (!game) {
        return
      }
      stats.begin()
      game.update()
      stats.end()
      requestAnimationFrame(() => animate())
    }

    window.addEventListener('resize', game.resize)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    document.addEventListener('click', this.handleMouse)

    this.game = game
    this.socket = socket
    animate()
  }

  emit = (...messages: unknown[]) => {
    if (this.socket) {
      this.socket.emit(CLIENT_COMMAND, ...messages)
    }
  }

  start = (message: Command) => {
    this.emit(message, CommandState.START)
  }

  stop = (message: Command) => {
    this.emit(message, CommandState.STOP)
  }

  handleMouse = (event: MouseEvent) => {
    if (this.game) {
      this.game.handleMouse(event)
    }
  }

  handleKeyboard = (handler: (message: Command) => void) => (
    event: KeyboardEvent
  ) => {
    switch (event.keyCode) {
      case Key.UP: {
        handler(Command.ACCELERATE)
        break
      }
      case Key.LEFT: {
        handler(Command.TURN_LEFT)
        break
      }
      case Key.RIGHT: {
        handler(Command.TURN_RIGHT)
        break
      }
    }
  }

  handleKeyUp = this.handleKeyboard(this.stop)
  handleKeyDown = this.handleKeyboard(this.start)

  componentWillUnmount() {
    if (this.game) {
      window.removeEventListener('resize', this.game.resize)
      this.game.destroy()
    }
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    document.removeEventListener('click', this.handleMouse)
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  render() {
    return (
      <>
        <div ref={this.rootNode} />
        <div ref={this.fpsCounter} />
      </>
    )
  }
}
