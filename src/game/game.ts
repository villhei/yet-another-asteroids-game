import Renderer from '~/renderer/renderer'
import { Vector3, toRadian, range } from '~/math'
import { generateAsteroid } from '~/model/asteroid'
import {
  GameWorld,
  Ship,
  GameWorldObject,
  INITIAL_WORLD,
  Asteroid
} from '~/model'
import { Command, CommandState } from './protocol'

const SHIP_ACCELERATION_SPEED = 0.02
const ASTEROID_COUNT = 10

export type GameInstance = {
  canvas: HTMLCanvasElement
  update: () => void
  resize: () => void
  destroy: () => void
  handleCommand: (command: Command, state: CommandState) => void
  handleMouse: (event: MouseEvent) => void
}

function updateControls(ship: Ship): Ship {
  if (ship.turningLeft) {
    ship.velocityAxial.z = +toRadian(3)
  }
  if (ship.turningRight) {
    ship.velocityAxial.z = -toRadian(3)
  }
  if (!(ship.turningLeft || ship.turningRight)) {
    ship.velocityAxial.z = 0
  }
  if (ship.acceleration) {
    const x = Math.cos(ship.rotation.z) * SHIP_ACCELERATION_SPEED
    const y = Math.sin(ship.rotation.z) * SHIP_ACCELERATION_SPEED

    ship.velocity.add(new Vector3(x, y, 0))
  }

  return ship
}

function updateRotation<T extends GameWorldObject>(entity: T): T {
  const rotation = entity.rotation.clone().add(entity.velocityAxial)
  return {
    ...entity,
    rotation
  }
}

function updatePosition<T extends GameWorldObject>(entity: T): T {
  const position = entity.position.clone().add(entity.velocity)
  return {
    ...entity,
    position
  }
}

function performCollision(s1: GameWorldObject, s2: GameWorldObject) {
  const REDUCTION_FACTOR = 0.8
  const n = s1.position
    .clone()
    .sub(s2.position)
    .normalize()
  const a1 = s1.velocity.dot(n)
  const a2 = s2.velocity.dot(n)
  const m1 = s1.mass
  const m2 = s2.mass
  const p = (2.0 * (a1 - a2)) / (m1 + m2)
  const velA = s1.velocity
    .clone()
    .sub(n.clone().multiplyScalar(p * m2 * REDUCTION_FACTOR))
  const velB = s2.velocity
    .clone()
    .add(n.clone().multiplyScalar(p * m1 * REDUCTION_FACTOR))
  s1.velocity.copy(velA)
  s2.velocity.copy(velB)
}

function testIntersect(a: GameWorldObject, b: GameWorldObject): boolean {
  return a.position.distanceTo(b.position) <= a.radius + b.radius
}

function testCollision(a: GameWorldObject, b: GameWorldObject): boolean {
  const radA = a.radius
  const radB = b.radius
  const sumRadii = radA + radB
  const dist = b.position.distanceTo(a.position) - sumRadii
  if (a.velocity.length() < dist) {
    return false
  }

  const velA = a.velocity
  const posA = a.position
  const posB = b.position
  const n = velA.clone().normalize()
  const c = posB.clone().sub(posA)
  const d = n.dot(c)
  if (d <= 0) {
    return false
  }
  const lengthC = c.length()
  const f = lengthC * lengthC - d * d
  const radSquared = sumRadii ** 2
  if (f >= radSquared) {
    return false
  }
  const t = radSquared - f
  if (t < 0) {
    return false
  }
  const distance = d - Math.sqrt(t)
  const length = a.velocity.length()

  if (length < distance) {
    return false
  }
  return true
}

function ifStarted(state: CommandState): boolean {
  return state === CommandState.START
}

function runCollisionsFor<T extends GameWorldObject>(
  entities: GameWorldObject[]
): (subject: T) => T {
  return (subject: T) => {
    entities.forEach(entity => {
      if (testCollision(subject, entity)) {
        performCollision(subject, entity)
      }
    })
    return subject
  }
}

export function createGame(): GameInstance {
  let world: GameWorld = INITIAL_WORLD

  const asteroids = range(0, ASTEROID_COUNT).reduce(
    (acc, n) => {
      let asteroid = generateAsteroid(world.width, world.height)
      const existing = acc.concat(world.ships)
      for (let object of existing) {
        const test = testIntersect(asteroid, object)
        if (test) {
          asteroid = generateAsteroid(world.width, world.height)
        }
      }
      return acc.concat(asteroid)
    },
    [] as Array<Asteroid>
  )

  world.asteroids = asteroids

  const renderer = new Renderer(world.width, world.height)

  const handleMouse = (event: MouseEvent) => {
    renderer.mouseClick(event)
  }

  const handleCommand = (cmd: Command, state: CommandState) => {
    switch (cmd) {
      case Command.ACCELERATE: {
        world.ships[0].acceleration = ifStarted(state)
        break
      }
      case Command.TURN_LEFT: {
        world.ships[0].turningLeft = ifStarted(state)
        break
      }
      case Command.TURN_RIGHT: {
        world.ships[0].turningRight = ifStarted(state)
        break
      }
    }
  }

  type Updater<T extends GameWorldObject> = (obj: T) => T

  const update = () => {
    const shipUpdates: Updater<Ship>[] = [
      updateControls,
      runCollisionsFor(world.asteroids),
      updateRotation,
      updatePosition
    ]

    world.ships = world.ships.map(ship =>
      shipUpdates.reduce((modified, fn) => fn(modified), ship)
    )

    const asteroidUpdates: Updater<Asteroid>[] = [
      runCollisionsFor(world.asteroids),
      updatePosition,
      updateRotation
    ]

    world.asteroids = world.asteroids.map(asteroid =>
      asteroidUpdates.reduce((modified, fn) => fn(modified), asteroid)
    )
    renderer.updateScene(world)
    renderer.renderScene()
  }

  const resize = () => {
    renderer.resize()
  }

  const destroy = () => {
    renderer.destroy()
  }

  const canvas = renderer.getCanvas()

  return {
    canvas,
    update,
    resize,
    handleCommand,
    handleMouse,
    destroy
  }
}
