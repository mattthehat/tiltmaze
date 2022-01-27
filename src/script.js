import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'


// Controls matrix
const tiltControls = document.querySelector('.controls')

let mousePressed = false

tiltControls.addEventListener('mousedown', function(){

    mousePressed = true
    
    this.addEventListener('mousemove', e => {
        const rect = this.getBoundingClientRect()
        const x = -((e.clientX - rect.left) / 200 - 0.5).toFixed(2); // X position -0.5 - 0.5
        const y = ((e.clientY - rect.top) / 200 - 0.5).toFixed(2);  //y position -0.5 -  0.5.



        if(mousePressed) {
           tiltBoard(x, y)
        }
    })
})

tiltControls.addEventListener('mouseup', () => {
    mousePressed = false
})

const tiltBoard = (x, y) => {

    const precisionX = (x / 9) 
    const precisionY = (y / 9) 

    floor.rotation.x = (-Math.PI * 0.5) + precisionX
    floor.rotation.y = precisionY

    floorBody.quaternion.setFromEuler(floor.rotation.x, floor.rotation.y, floor.rotation.z)

}

// Joystick

const joystick = document.querySelector('.joystick')

tiltControls.addEventListener('mousemove', e => {
    joystick.style.top = `${e.clientY - 25}px`
    joystick.style.left = `${e.clientX - 25}px`
    console.log(e.clientX);

})




/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const colour = textureLoader.load('textures/wood/colour.png')
const roughness = textureLoader.load('textures/wood/roughness.png')

/**
 * Material
 */

const woodMaterial = new THREE.MeshStandardMaterial({
    map: colour,
    roughnessMap: roughness
})

/**
 * THREE Shapes
 */

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    woodMaterial
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

const wallGeometry = new THREE.BoxGeometry(10, 0.5, 1)

// Top Wall
const topWall = new THREE.Mesh(
    wallGeometry,
    woodMaterial
)
topWall.receiveShadow = true
topWall.castShadow = true
topWall.rotation.y = Math.PI * 0.5
topWall.position.set(4.5, 0.25, 0)
topWall.scale.x = 0.8

scene.add(topWall)

// Bottom Wall
const bottomWall = new THREE.Mesh(
    wallGeometry,
    woodMaterial
)
bottomWall.receiveShadow = true
bottomWall.castShadow = true
bottomWall.rotation.y = Math.PI * 0.5
bottomWall.position.set(-4.5, 0.25, 0)
bottomWall.scale.x = 0.8

scene.add(bottomWall)

// Left wall
const leftWall = new THREE.Mesh(
    wallGeometry,
    woodMaterial
)
leftWall.receiveShadow = true
leftWall.castShadow = true
leftWall.position.set(0, 0.25, -4.5)

scene.add(leftWall)

// Right wall
const rightWall = new THREE.Mesh(
    wallGeometry,
    woodMaterial
)
rightWall.receiveShadow = true
rightWall.castShadow = true
rightWall.position.set(0, 0.25, 4.5)

scene.add(rightWall)

// Ball

const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.8,
        roughness: 0.3,
        
        color: '#eee'
    })
)

ball.castShadow = true

scene.add(ball)


/**
 * Physics
 */

// World
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
})

// world.allowSleep = true

// Materials
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.6
    }
)

world.addContactMaterial(defaultContactMaterial)

// Floor
const floorBody = new CANNON.Body({
    mass:0,
    position: new CANNON.Vec3(0, 0, 0),
    shape: new CANNON.Plane(),
    material: defaultMaterial
})

floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0), 
    Math.PI * 0.5
)

world.addBody(floorBody)

// Top wall body
const topWallBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(4.5,0.25,0),
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.25, 0.5)),
    material: defaultMaterial
})

topWallBody.quaternion.setFromEuler(0, -Math.PI * 0.5, 0)

world.addBody(topWallBody)

// bottom wall body
const bottomWallBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(-4.5,0.25,0),
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.25, 0.5)),
    material: defaultMaterial
})

bottomWallBody.quaternion.setFromEuler(0, -Math.PI * 0.5, 0)

world.addBody(bottomWallBody)

// left wall body
const leftWallBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0,0.25,-4.5),
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.25, 0.5)),
    material: defaultMaterial
})

world.addBody(leftWallBody)

// right wall body
const rightWallBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0,0.25,4.5),
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.25, 0.5)),
    material: defaultMaterial
})

world.addBody(rightWallBody)

// Ball

const ballBody = new CANNON.Body({
    mass: 3,
    position: new CANNON.Vec3(0,0.1,0),
    shape: new CANNON.Sphere(0.25),
    material: defaultMaterial
})

world.addBody(ballBody)


// Debugger
const cannonDebugger = new CannonDebugger(scene, world)


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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

let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime

    oldElapsedTime = elapsedTime

    world.step(1 / 60, deltaTime, 3)


    ball.position.copy(ballBody.position)

    

    world.step(1 / 60, deltaTime, 3)

    // cannonDebugger.update()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()