import { Asteroid, GameObject, genId } from '~/model'
import { toRadian, Vector3 } from '~/math'

const ASTEROID_ROTATION = 0.02
const ASTEROID_MIN_RADIUS = 30
const ASTEROID_MAX_RADIUS = 50
const ASTEROID_TILT = toRadian(180)

function scaledRnd(scale: number): number {
  return Math.random() * scale - scale / 2
}

function randomPosition(width: number, height: number): Vector3 {
  return new Vector3(scaledRnd(width), scaledRnd(height), 0)
}

function randomRotation(): Vector3 {
  return new Vector3(0, scaledRnd(ASTEROID_ROTATION), 0)
}

function randomTilt(): Vector3 {
  return new Vector3(
    scaledRnd(ASTEROID_TILT),
    scaledRnd(ASTEROID_TILT),
    scaledRnd(ASTEROID_TILT)
  )
}

export const generateAsteroid = (width: number, height: number): Asteroid => {
  const radius =
    ASTEROID_MIN_RADIUS + scaledRnd(ASTEROID_MAX_RADIUS - ASTEROID_MIN_RADIUS)
  const mass = radius * 100

  return {
    uuid: genId(),
    radius,
    mass,
    kind: GameObject.ASTEROID,
    position: randomPosition(width, height),
    rotation: randomTilt(),
    velocity: new Vector3(0.0, 0, 0),
    velocityAxial: randomRotation()
  }
}
