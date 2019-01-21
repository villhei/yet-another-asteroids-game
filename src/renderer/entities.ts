import * as THREE from 'three'
import { Color } from '~/renderer/constants'
import { Ship, Asteroid } from '~/model'
import { Vector3 } from '~/math'

const SHIP_LINE_OPTS = {
  color: Color.WHITE,
  linewidth: 3
}

export function getShipGeometry(ship: Ship): THREE.Line {
  const lineGeometry = new THREE.Geometry()
  const { radius, position, rotation } = ship
  lineGeometry.vertices.push(new Vector3(-radius, radius, 0))
  lineGeometry.vertices.push(new Vector3(radius, 0, 0))
  lineGeometry.vertices.push(new Vector3(-radius, -radius, 0))

  const lineMaterial = new THREE.LineBasicMaterial(SHIP_LINE_OPTS)

  const shipModel = new THREE.Line(lineGeometry, lineMaterial)

  shipModel.position.copy(position)
  shipModel.rotation.setFromVector3(rotation)
  return shipModel
}

export function getAsteroidGeometry(asteroid: Asteroid): THREE.Group {
  const geometry = new THREE.SphereGeometry(asteroid.radius, 6, 6)
  const fillMaterial = new THREE.MeshStandardMaterial({
    color: Color.WHITE,
    flatShading: true
  })
  const lineMaterial = new THREE.MeshBasicMaterial({
    color: Color.WHITE,
    wireframeLinewidth: 2,
    wireframe: true
  })
  const group = new THREE.Group()

  const fill = new THREE.Mesh(geometry, fillMaterial)
  const stroke = new THREE.LineSegments(geometry, lineMaterial)
  group.position.copy(asteroid.position)
  group.add(fill).add(stroke)
  return group
}
