import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import createWays from './ways/way'
import createSkybox from './skybox'
import createLights from './light'
import createGround from './ground'
//import control from './controls/control'
import createMenu from './controls/menu.js'
import createButtons from './controls/drivebuttons'
import createFreeCamera from './cameras/freecamera'
import createCamera from './cameras/camera'
import dressMap from './environment/dressmap'
import createDefaultCar from './car/detailedcar'
import loop from './controls/loops'
import { AssetContainer } from '@babylonjs/core/assetContainer'
import startup from './startup'
import score from './scoring/scoring'
import { SineEase } from '@babylonjs/core/Animations/easing'
import {setupGps} from './gps/plan'
import {setupMirror} from './mirror/centralmirror.ts'
import { DefaultLoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import {createLoading} from './creators/loadingCreator'
//import {carBotsLoop} from './npcs/carbots.ts'
import {carBotsLoop} from './npcs/carbotsIndependantDetector'
//import {carBotsLoop} from './npcs/carbotsSPS'

let loadingStatus = {assets: false, car: false, randomgen: false, trees: false, walk: false, ground: false, count: 0}
let loadingInter
let lasttype

export function setStatus(type){
    lasttype = type;
    loadingStatus[type] = true
    loadingStatus.count += 100/6
    // console.log(type, loadingStatus.count)
    if (loadingStatus.count >= 100){
       engine.hideLoadingUI()
    }
}

DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    if (document.getElementById("customLoadingScreenDiv")) {
        // Do not add a loading screen if there is already one
        document.getElementById("customLoadingScreenDiv").style.display = "initial"
        return
    }
    
    let {loadtext, loadbar} = createLoading()

    loadingInter = setInterval(() => {
        let toload = []
        for (let  elem in loadingStatus){ if (loadingStatus[elem] == false) { toload.push(elem)}}
        loadbar.style.width = `${loadingStatus.count}%`
       // this._percentage.innerHTML = `(${loadingStatus.count.toFixed(2)}%) loaded: ${lasttype},\n loading: ${toload}`
        if (loadtext.innerHTML.includes('...')){
            loadtext.innerHTML = 'Chargement'
        } else {
            loadtext.innerHTML = loadtext.innerHTML + '.'
        }
        
    }, 200)
    this._resizeLoadingUI()
    window.addEventListener("resize", this._resizeLoadingUI)
};

DefaultLoadingScreen.prototype.hideLoadingUI = function(){
    document.getElementById("customLoadingScreenDiv").remove()
    clearInterval(loadingInter)
    console.log("LOADED")
}

const canvas = document.getElementById('renderCanvas')
const engine = new Engine(canvas,false,null,false)
const boot = () => {
    let gps;
    let mustang;
    let waitcar = true;
    const planes = []

    // Get the canvas element from the DOM.
    scene = new Scene(engine);
    createGround(scene);
    engine.displayLoadingUI();

    // Creates and sets camera 
    const camera = createCamera(scene, canvas);//NORMAL CAMERA
    const internalCamera = createCamera(scene, canvas, 1);
    const freecamera = createFreeCamera(scene, canvas);
    //Creates environements and camera
    createSkybox(scene)
    createLights(scene)
    //Container to handle multiple meshes, useful to duplicate without reloading, and to access the main car loading state
    let container = new AssetContainer(scene);
    
    //Creates car, AIs, road and add assets
    try{
        createDefaultCar(scene, camera, internalCamera, container);
    } catch (e){}
    
    createWays(scene, planes)
    dressMap(scene, container)

    //Create all menus and UI Elements
    createMenu(scene, camera, internalCamera, freecamera);
    createButtons(scene);
    loop.setupControls(scene);

    setupGps(scene, container);
    setupMirror(engine, freecamera)
    loop.cameraOrientationSetup(camera);
    scene.activeCamera = internalCamera;
//    document.body.insertAdjacentHTML('afterbegin', `<div style='position: absolute; top: 10vh; left: 50vh;'>FOV: ${scene.activeCamera.fov}</div>`)

    //optimization
    scene.autoClear = false // Color buffer
    scene.autoClearDepthAndStencil = false//looks OK
    scene.blockMaterialDirtyMechanism = true//material clearing
    //
    engine.runRenderLoop(() => {
        //planes.forEach(p => p.rotation.y = p.rotation.y  + 0.01)
        scene.render()
         if (waitcar && (mustang = container['meshes'].find(mesh => mesh.name == 'detailedcar'))) { 
                waitcar = false;
                score.setupScore(mustang);
        } else if (!waitcar){
            score.loop()
           // scene.activeCamera = freecamera//DEBUG, TO COMMENT
            carBotsLoop()
            loop.loopSelector(scene, mustang, gps)
        }
    })
}

startup(boot)

export let scene = null
