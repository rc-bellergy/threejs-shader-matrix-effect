import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import anime from '../lib/anime.js'
import fragmentShader from './shaders/matrix/fragment.glsl'
import vertexShader from './shaders/matrix/vertex.glsl'
import test01FragmentShader from './shaders/test01/fragment.glsl'
import test01VertexShader from './shaders/test01/vertex.glsl'
import Stats from 'three/examples/jsm/libs/stats.module.js'

// Promise Loader
function promiseLoader (loader, url) {
    return new Promise((resolve, reject) => {
        loader.load(url, data => resolve(data), null, reject)
    })
}
// Matrix Shader
const uniforms = {
    u_mouse: { value: { x: window.innerWidth / 2, y: window.innerHeight / 2 } },
    u_resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
    u_time: { value: 0.0 }
}
const matrixMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms
})

// Testing Shader
const testingUniforms = {}
const test01Material = new THREE.ShaderMaterial({
    vertexShader: test01VertexShader,
    fragmentShader: test01FragmentShader,
    uniforms
})

// Handling resize
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Add Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.position.set(2.5,2.9,0.7)
scene.add(directionalLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)
camera.position.set(9, 13, -9)
scene.add(camera)

/**
 *  Orbit Control
 */
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true
controls.autoRotate = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // update matrix time uniform
    uniforms.u_time.value = clock.getElapsedTime();

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

/**
 * Main Start
 */
async function main () {

    /**
     * Load object
     */
    // { }
    const gltfLoader = new GLTFLoader()
    const pModel = await promiseLoader(gltfLoader, 'models/{/{.glb')
    const leftP = pModel.scene.children[0]
    const materialYellow = new THREE.MeshStandardMaterial({
        color: '#FFCE00',
        metalness: 0,
        roughness: 0.5
    })
    leftP.castShadow = true
    leftP.material = materialYellow
    leftP.position.x = -2
    scene.add(leftP)

    const rightP = leftP.clone()
    rightP.position.x = 2
    rightP.rotation.y = Math.PI
    scene.add(rightP)

    // Pill
    const pill = new THREE.Group()
    pill.rotation.x = Math.PI * 0.5
    scene.add(pill)

    const pillModel = await promiseLoader(gltfLoader, 'models/pill/pill.glb')
    const pillTop = pillModel.scene.children[0]
    const materialRedMetal = new THREE.MeshStandardMaterial({
        color: '#FF004C',
        metalness: 0.5,
        roughness: 0.4
    })
    pillTop.material = materialRedMetal
    pillTop.scale.set(0.6,0.6,0.6)
    pillTop.castShadow = true
    pill.add(pillTop)

    const pillBottom = pillTop.clone()
    const materialWireframe = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.5,
        roughness: 0.4,
        wireframe: true
    })
    pillBottom.material = materialWireframe
    pillBottom.rotation.x = Math.PI
    pillBottom.position.y = -0.085
    pillBottom.castShadow = true
    pill.add(pillBottom)
    
    // Animate the pill
    anime({
        targets: pill.rotation,
        x: Math.PI * 2.5,
        duration: 2000,
        loop: true,
        easing: 'linear'
    })
    anime({
        targets: pill.rotation,
        z: Math.PI * 2,
        duration: 5000,
        loop: true,
        easing: 'linear'
    })

    // Document
    const documentModel = await promiseLoader(gltfLoader, 'models/document/document.glb')
    const document = documentModel.scene.children[0]

    document.material = matrixMaterial
    // document.material = test01Material

    document.rotation.y = Math.PI * 0.5
    document.rotation.x = Math.PI * 0.55
    document.scale.set(1.5,1.5,1.5)
    document.position.y = -1.5
    scene.add(document)

    // Create shadow layer
    const shadowDoc = document.clone()
    shadowDoc.material = new THREE.ShadowMaterial({
        opacity: 0.7
    })
    shadowDoc.receiveShadow = true
    shadowDoc.position.y = -1.49
    scene.add(shadowDoc)
    
    // Start the loop
    tick()

    // Debug UI
    const gui = new dat.GUI()
    const proxy = {
        material: 'matrixMaterial'
    }
    gui.add(controls, 'autoRotate')

    gui.add(proxy, 'material', { Matrix2D: 'matrixMaterial', Matrix3D: 'test01Material'}).onChange((e) => {
        document.material = eval(e)
    })

    gui.add(camera.position, 'x', -20, 20).name("Camera X")
    gui.add(camera.position, 'y', -20, 20).name("Camera Y")
    gui.add(camera.position, 'z', -20, 20).name("Camera Z")

    gui.add(directionalLight.position, 'x', -20, 20).name("Light X")
    gui.add(directionalLight.position, 'y', -20, 20).name("Light Y")
    gui.add(directionalLight.position, 'z', -20, 20).name("Light Z")

}
main().catch(error => {
    console.error(error);
});

// Stats UI
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)


