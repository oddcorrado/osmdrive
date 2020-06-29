import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import textPanel from './textPanel'
import createBuildings from './building'
import createWays from './way'
import createSkybox from './skybox'
import createCamera from './camera'
import createLights from './light'
import createGround from './ground'
import control from './control'
import createCar from './car'
import setupPhysics from './physics'

const planes = []

// Get the canvas element from the DOM.
const canvas = document.getElementById('renderCanvas')
const engine = new Engine(canvas);
const scene = new Scene(engine);
const ground = createGround(scene)
const camera = createCamera(scene, canvas)
createWays(scene, planes)
createBuildings(scene)
createSkybox(scene)
createLights(scene)
const car = createCar(scene)
setupPhysics(scene, ground, car)

control.setup(scene)
camera.parent = car

// Render every frame
engine.runRenderLoop(() => {
    planes.forEach(p => p.rotation.y = p.rotation.y  + 0.01)
    scene.render()
    control.loop(car)
})