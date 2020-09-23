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
import botshandler from './bots'
import setupPhysics from './physics'
import createFreeCamera from './freecamera'
import toggleCamera from './togglecamera'
import createMenu from './menu.js'

const planes = []

// Get the canvas element from the DOM.
const canvas = document.getElementById('renderCanvas')
const engine = new Engine(canvas);
const scene = new Scene(engine);
const ground = createGround(scene);
const camera = createCamera(scene, canvas);//NORMAL CAMERA
const freecamera = createFreeCamera(scene, canvas);
scene.activeCamera = camera; 

createWays(scene, planes)
createBuildings(scene)
createSkybox(scene)
createLights(scene)
toggleCamera(scene, camera, freecamera, false);

const car = createCar(scene)
//test Bots
const bots = botshandler.createBots(scene)
bots.forEach(bot => {//comment too enable bots by default
    bot.isVisible = false;
    bot.setEnabled(false);
})
//endtest

createMenu(scene, camera, freecamera, bots);
setupPhysics(scene, ground, car, bots)
control.setup(scene)
camera.parent = car

// Render every frame
engine.runRenderLoop(() => {
    planes.forEach(p => p.rotation.y = p.rotation.y  + 0.01)
    scene.render()
    control.loop(car)
    botshandler.loop(bots)
})