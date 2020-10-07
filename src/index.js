import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import textPanel from './textPanel'
import createBuildings from './building'
import createWays from './way'
import createSkybox from './skybox'
import createCamera from './cameras/camera'
import createLights from './light'
import createGround from './ground'
import control from './control'
import createCar from './car'
import botshandler from './bots'
import setupPhysics from './physics'
import createFreeCamera from './cameras/freecamera'
import toggleCamera from './cameras/togglecamera'
import createMenu from './menu.js'
import dressMap from './dressmap'
import createDetailedCar from './detailedcar'
import { AssetContainer } from '@babylonjs/core/assetContainer'

const planes = []
// Get the canvas element from the DOM.
const canvas = document.getElementById('renderCanvas')
const engine = new Engine(canvas);
export const scene = new Scene(engine);
const ground = createGround(scene);
const camera = createCamera(scene, canvas);//NORMAL CAMERA
const freecamera = createFreeCamera(scene, canvas);
scene.activeCamera = camera; 
var switchcar = 'old';
var tmpcar;

//Creates environements and camera
createSkybox(scene)
createLights(scene)
toggleCamera(scene, camera, freecamera, false);

//Container to handle multiple meshes, useful to duplicate without reloading
var container = new AssetContainer(scene);

//Creates cars meshes
//createDetailedCar(scene, camera, container);
var car = createCar(scene);

//Create main meshes 
createWays(scene, planes)
var grids = createBuildings(scene)
//dressMap(scene)
//create loading depending on props;

const bots = botshandler.createBots(scene)
bots.forEach(bot => {//comment to disable bots by default
    bot.isVisible = false;
    bot.setEnabled(false);
})

createMenu(scene, camera, freecamera, bots, grids);
setupPhysics(scene, ground, car, bots)


control.setup(scene);
camera.parent = car;
// Render every frame

engine.runRenderLoop(() => {
    planes.forEach(p => p.rotation.y = p.rotation.y  + 0.01)
    scene.render()
   if (switchcar === 'old' && (tmpcar = container['meshes'].find(mesh => mesh.name == 'detailedcar'))){
       switchcar = 'new';
       car = tmpcar;
   }
    control.loop(car)

    botshandler.loop(bots)
})