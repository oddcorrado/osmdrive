import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import textPanel from './textPanel'
import createBuildings from './building'
import createWays from './ways/way'
import createSkybox from './skybox'
import createLights from './light'
import createGround from './ground'
//import control from './controls/control'
import createMenu from './controls/menu.js'
import createButtons from './controls/drivebuttons'
import createCar from './debug/car'
import botshandler from './bots'
import physics from './physics'
import createFreeCamera from './cameras/freecamera'
import createCamera from './cameras/camera'
import dressMap from './dressmap'
import {createMainCar} from './carwithphysics'
import createDefaultCar from './detailedcar'
import loop from './controls/loops'
import { AssetContainer } from '@babylonjs/core/assetContainer'
import startup from './startup'
import score from './scoring/scoring'
import { SineEase } from '@babylonjs/core/Animations/easing'
import {setupGps} from './gps/plan'

const boot = () => {
    var oldcar;
    var motor;
    var steer;
    let gps;
    var clio;
    var mustang;
    var switchcar = 'old';
    const planes = []

    // Get the canvas element from the DOM.
    const canvas = document.getElementById('renderCanvas')
    const engine = new Engine(canvas);
    scene = new Scene(engine);
    const ground = createGround(scene);

    // Creates and sets camera 
    const camera = createCamera(scene, canvas);//NORMAL CAMERA
    const internalCamera = createCamera(scene, canvas, 1);
    const freecamera = createFreeCamera(scene, canvas);
    //Creates environements and camera
    createSkybox(scene)
    createLights(scene)
    physics.enablePhysics(scene);
    //Container to handle multiple meshes, useful to duplicate without reloading
    var container = new AssetContainer(scene);
    
    //Creates cars
    var boxcar = createCar(scene);
    createDefaultCar(scene, camera, internalCamera, container);
    //createMainCar(scene, camera, internalCamera, container);


    //Create map road and multiple meshes 
    createWays(scene, planes)
    var grids// = createBuildings(scene)
    dressMap(scene, container);
    

    //Create all menus and UI Elements
    createMenu(scene, camera, internalCamera, freecamera, /*bots,*/ grids);
    createButtons(scene);
    loop.setupControls(scene);
    physics.setupPhysics(scene, ground, boxcar/*, bots*/)

    setupGps(scene, container);
    loop.cameraOrientationSetup(camera);
    
    camera.parent = boxcar;
    internalCamera.parent = boxcar;
    scene.activeCamera = internalCamera;
    // Render every frame
    engine.runRenderLoop(() => {
        //planes.forEach(p => p.rotation.y = p.rotation.y  + 0.01)
        scene.render()
         if (switchcar === 'old' /*&& (clio = container['meshes'].find(mesh => mesh.name == 'clio'))  
            && (steer = container['meshes'].find(mesh => mesh.name == 'sjoints'))
            && (motor = container['meshes'].find(mesh => mesh.name == 'joints'))
            && (gps = container['meshes'].find(mesh => mesh.name == 'arrow'))*/
            && (mustang = container['meshes'].find(mesh => mesh.name == 'detailedcar'))) { 
                switchcar = 'new';
                score.setupScore(mustang);
                oldcar = boxcar;
                oldcar.dispose();
        }
        if (switchcar === 'new'){
            //loop.loopSelector(scene, motor.joints, steer.sjoints, clio, mustang);
            loop.loopSelector(scene, null, null, null, mustang, gps);
            score.loop();
        }   

    })
}

startup(boot)

export let scene = null
