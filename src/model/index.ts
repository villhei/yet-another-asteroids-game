import uuid from 'uuid'
import { Vector3 } from '~/math'

export type UUID = string

export enum GameObject {
  SHIP = 'SHIP',
  ASTEROID = 'ASTEROID'
}

function isEnum<T extends {}>(enumObj: T) {
  return function(candidate: unknown): candidate is T {
    return Object.values(enumObj).some(obj => obj === candidate)
  }
}

const isGameObject = isEnum(GameObject)

export type ObjectKind = 'SHIP' | 'ASTEROID'

export interface GameWorldObject {
  uuid: UUID
  kind: ObjectKind
  position: Vector3
  rotation: Vector3
  radius: number
  mass: number
  velocity: Vector3
  velocityAxial: Vector3
}

export interface Ship extends GameWorldObject {
  acceleration: boolean
  turningLeft: boolean
  turningRight: boolean
}

export interface Asteroid extends GameWorldObject {
  radius: number
}

export type GameWorld = {
  width: number
  height: number
  ships: Array<Ship>
  asteroids: Array<Asteroid>
}

const WORLD_WIDTH = 500
const WORLD_HEIGHT = 500

export const INITIAL_WORLD: GameWorld = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
  ships: [
    {
      uuid: genId(),
      kind: GameObject.SHIP,
      radius: 10,
      mass: 100,
      acceleration: false,
      turningLeft: false,
      turningRight: false,
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
      velocity: new Vector3(0.0, 0, 0),
      velocityAxial: new Vector3(0, 0.0, 0.0)
    }
  ],
  asteroids: []
}

export function genId(): UUID {
  return uuid.v4()
}
