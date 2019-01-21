import * as THREE from 'three'
import { GameWorld } from '~/model'
import { Color } from '~/renderer/constants'
import { createObjectManager, ObjectManager } from '~/renderer/objectManager'
import { Vector3 } from '~/math'
import { object } from 'prop-types'

const RENDERER_DEFAULTS = {
  alpha: true,
  clearColor: Color.BLACK
}

const ORIGO = new Vector3(0, 0, 0)
const RENDERER_RESOLUTION_SCALING_FACTOR = 50
const CAMERA_FAR = 1000
const CAMERA_NEAR = 0.1

function worldScale(
  wWidth: number,
  wHeight: number,
  innerWidth: number,
  innerHeight: number
): number {
  return Math.max(wWidth / innerWidth, wHeight / innerHeight)
}

function toScale(n: number, scale: number): number {
  console.log('scale', scale)
  return n / 2
}

function dimensions(worldWidth: number, worldHeight: number) {
  const { innerWidth, innerHeight } = window
  const width = innerWidth
  const height = innerHeight
  const scale = worldScale(worldWidth, worldHeight, innerWidth, innerHeight)

  const left = -toScale(worldWidth, scale)
  const right = toScale(worldWidth, scale)
  const top = toScale(worldHeight, scale)
  const bottom = -toScale(worldHeight, scale)
  return {
    width,
    height,
    aspect: width / height,
    left,
    right,
    top,
    bottom
  }
}

export default class Renderer {
  private scene: THREE.Scene
  private canvas: HTMLCanvasElement
  private instance: THREE.WebGLRenderer
  private camera: THREE.OrthographicCamera
  private objectManager: ObjectManager
  private renderObjects: THREE.Group
  private rayCaster: THREE.Raycaster
  private worldWidth: number
  private worldHeight: number

  constructor(worldWidth: number, worldHeight: number) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') as WebGLRenderingContext
    const options = {
      canvas,
      context,
      ...RENDERER_DEFAULTS
    }
    const dim = dimensions(worldWidth, worldHeight)
    const { width, height, left, right, top, bottom } = dim

    const renderer = new THREE.WebGLRenderer(options)
    const rayCaster = new THREE.Raycaster()

    renderer.setClearAlpha(1)
    renderer.setSize(width, height)

    const camera = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      CAMERA_NEAR,
      CAMERA_FAR
    )
    const scene = new THREE.Scene()

    const renderObjects = new THREE.Group()

    const ambientLight = new THREE.AmbientLight(Color.WHITE, 0.4)
    const light = new THREE.PointLight(Color.WHITE, 0.8, 300, 2)
    const light2 = new THREE.PointLight(Color.WHITE, 0.8, 300)

    scene.add(ambientLight)
    scene.add(light)
    scene.add(light2)

    scene.add(renderObjects)

    light.position.set(10, 10, 100)
    light2.position.set(-10, -10, 100)
    camera.position.set(0, 0, 100)
    camera.lookAt(ORIGO)

    this.objectManager = createObjectManager()
    this.canvas = renderer.domElement
    this.instance = renderer
    this.scene = scene
    this.camera = camera
    this.rayCaster = rayCaster
    this.renderObjects = renderObjects
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
  }

  updateScene = (world: GameWorld) => {
    const { renderObjects, objectManager } = this
    objectManager.updateScene(renderObjects, world.ships)
    objectManager.updateScene(renderObjects, world.asteroids)
  }

  renderScene = () => {
    if (!this.instance) {
      return
    }
    const scene = this.scene
    this.instance.render(scene, this.camera)
  }

  destroy = () => {
    this.instance.forceContextLoss()
    delete this.instance.context
    delete this.instance.domElement
    delete this.instance
  }

  resize = () => {
    const { instance: renderer, camera, worldWidth, worldHeight } = this
    const { width, height, left, right, top, bottom } = dimensions(
      worldWidth,
      worldHeight
    )

    renderer.setSize(window.innerWidth, window.innerHeight)

    this.camera = updateCamera(camera, left, right, top, bottom)

    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  getCanvas = (): HTMLCanvasElement => {
    return this.canvas
  }

  mouseClick = ({ clientX, clientY }: MouseEvent) => {
    if (!this.instance) {
      return
    }
    const { clientWidth, clientHeight } = this.instance.domElement
    const mouse = new THREE.Vector2(
      (clientX / clientWidth) * 2 - 1,
      -(clientY / clientHeight) * 2 + 1
    )
    this.rayCaster.setFromCamera(mouse, this.camera)
    const intersects = this.rayCaster.intersectObjects(
      this.scene.children,
      true
    )
    intersects.forEach(target => console.log('Clicked: ', target.object.parent))
  }
}

function updateCamera(
  camera: THREE.OrthographicCamera,
  left: number,
  right: number,
  top: number,
  bottom: number
): THREE.OrthographicCamera {
  return Object.assign(camera, { left, right, top, bottom })
}
