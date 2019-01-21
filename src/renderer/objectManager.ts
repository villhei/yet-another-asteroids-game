import * as THREE from 'three'
import { getAsteroidGeometry, getShipGeometry } from '~/renderer/entities'
import { GameObject, Ship, Asteroid, GameWorldObject } from '~/model'

type SceneObject3DMap = {
  [id: string]: THREE.Object3D
}

function createOfType(object: GameWorldObject): THREE.Object3D {
  switch (object.kind) {
    case GameObject.ASTEROID: {
      return getAsteroidGeometry(object as Asteroid)
    }
    case GameObject.SHIP: {
      return getShipGeometry(object as Ship)
    }
    default: {
      throw new TypeError(
        'Unknown WorldObject, received\n' + JSON.stringify(object, null, 2)
      )
    }
  }
}

function createIfNotExists(
  worldObjects: SceneObject3DMap,
  object: GameWorldObject
): THREE.Object3D | null {
  const { uuid } = object
  if (worldObjects[uuid]) {
    return null
  }
  const model = createOfType(object)
  worldObjects[uuid] = model
  return model
}

export interface ObjectManager {
  updateScene: (
    sceneObject: THREE.Group,
    entities: Array<GameWorldObject>
  ) => SceneObject3DMap
  getAll: () => Array<THREE.Object3D>
}

export function createObjectManager(): ObjectManager {
  const worldObjects: SceneObject3DMap = {}

  const updateScene = (
    sceneObjects: THREE.Group,
    entities: Array<GameWorldObject>
  ): SceneObject3DMap => {
    entities.forEach(entity => {
      const model = createIfNotExists(worldObjects, entity)
      if (model) {
        sceneObjects.add(model)
      }
      const worldObject = worldObjects[entity.uuid]
      worldObject.position.copy(entity.position)
      worldObject.rotation.setFromVector3(entity.rotation)
    })
    return worldObjects
  }

  const getAll = () => Object.values(worldObjects)

  return {
    updateScene,
    getAll
  }
}
