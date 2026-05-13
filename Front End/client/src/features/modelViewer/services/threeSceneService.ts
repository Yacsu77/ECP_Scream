import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type { SupportedFormat } from '@/lib/constants'

export type ModelLoader = GLTFLoader | STLLoader

export interface SceneConfig {
  width: number
  height: number
  fov?: number
  near?: number
  far?: number
  backgroundColor?: number | string
}

export interface LoadedResult {
  object: THREE.Object3D
  boundingBox: THREE.Box3
  center: THREE.Vector3
  size: THREE.Vector3
}

/**
 * Facade over Three.js scene primitives.
 * Follows SOLID: single responsibility per method, open for extension via injected loaders.
 */
export class ThreeSceneFacade {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private lights: THREE.Light[] = []

  constructor(canvas: HTMLCanvasElement, config: SceneConfig) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(config.backgroundColor ?? 0x0a0a0f)

    this.camera = new THREE.PerspectiveCamera(
      config.fov ?? 45,
      config.width / config.height,
      config.near ?? 0.1,
      config.far ?? 1000
    )
    this.camera.position.set(0, 1.5, 4)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(config.width, config.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.setupLights()
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    const directional = new THREE.DirectionalLight(0xffffff, 1.2)
    directional.position.set(5, 8, 5)
    directional.castShadow = true
    const fill = new THREE.DirectionalLight(0x8888ff, 0.4)
    fill.position.set(-5, -2, -5)
    const rim = new THREE.PointLight(0x6366f1, 0.8, 20)
    rim.position.set(-3, 3, -3)

    this.lights = [ambient, directional, fill, rim]
    this.lights.forEach((l) => this.scene.add(l))
  }

  getScene(): THREE.Scene { return this.scene }
  getCamera(): THREE.PerspectiveCamera { return this.camera }
  getRenderer(): THREE.WebGLRenderer { return this.renderer }

  addObject(object: THREE.Object3D): void {
    this.scene.add(object)
  }

  removeObject(object: THREE.Object3D): void {
    this.scene.remove(object)
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    this.renderer.dispose()
    this.lights.forEach((l) => {
      this.scene.remove(l)
      l.dispose?.()
    })
  }
}

/**
 * Factory: creates the right loader for a given 3D format.
 */
export function createModelLoader(format: SupportedFormat): ModelLoader {
  if (format === 'glb') return new GLTFLoader()
  return new STLLoader()
}

/**
 * Normalize loaded geometry to fit within a unit cube centered at origin.
 */
export function normalizeObject(object: THREE.Object3D): LoadedResult {
  const boundingBox = new THREE.Box3().setFromObject(object)
  const center = boundingBox.getCenter(new THREE.Vector3())
  const size = boundingBox.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = maxDim > 0 ? 2 / maxDim : 1

  object.position.sub(center)
  object.scale.setScalar(scale)

  return { object, boundingBox, center, size }
}
