import {
    Engine
} from "@babylonjs/core/Engines/engine";
import {
    Scene
} from "@babylonjs/core/scene";
import {
    Vector3
} from "@babylonjs/core/Maths/math";
import {
    FreeCamera
} from "@babylonjs/core/Cameras/freeCamera";
import {
    HemisphericLight
} from "@babylonjs/core/Lights/hemisphericLight";
import {
    DirectionalLight
} from "@babylonjs/core/Lights/directionalLight";

import {
    Mesh
} from "@babylonjs/core/Meshes/mesh";

import {
    StandardMaterial
} from "@babylonjs/core/Materials/standardMaterial";

// import { Vector3 } from '@babylonjs/core/Maths/math.vector' 
import { ShadowGeneratorSceneComponent } from '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Path3D } from '@babylonjs/core/Maths/math.path'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { ways, buildings } from './map'
import {CubeTexture} from '@babylonjs/core/Materials/Textures/cubeTexture'
// import BuildingTexture from './building.png'

console.log(ways)
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas");

// Associate a Babylon Engine to it.
const engine = new Engine(canvas);

// Create our first scene.
var scene = new Scene(engine);

// This creates and positions a free camera (non-mesh)
var camera = new FreeCamera("camera1", new Vector3(0, 30, 0), scene);

// This targets the camera to scene origin
camera.setTarget(Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
const hemiLight = new HemisphericLight("light1", new Vector3(0, 100, 0), scene);
const dirLight = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
hemiLight.intensity = 0;
dirLight.intensity = 1;

hemiLight.diffuse = new Color3(0, 0, 0);
hemiLight.specular = new Color3(0, 0, 0);
hemiLight.groundColor = new Color3(0.2, 0.2, 1);

dirLight.diffuse = new Color3(1, 1, 1);
dirLight.specular = new Color3(1, 1, 1);
dirLight.groundColor = new Color3(1, 1, 0);

// Create a grid material
var material = new StandardMaterial("grid", scene);

// SHADOWS
// const shadowGenerator = new ShadowGenerator(8192, dirLight)
// shadowGenerator.usePoissonSampling = true

// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);

// Move the sphere upward 1/2 its height
sphere.position.y = 2;

// Affect a material
sphere.material = material;

const groundMat = new StandardMaterial("groundMat", scene);
groundMat.alpha = 1;
groundMat.diffuseColor = new Color3(1, 1, 1)
groundMat.specularColor = new Color3(0, 0, 0)
groundMat.emissiveColor = new Color3(0.2, 0.2, 0.2)
const groundTexture = new Texture('./ground.png', scene)
groundTexture.vScale = 100
groundTexture.uScale = 100
groundMat.diffuseTexture = groundTexture
groundMat.backFaceCulling = false;

// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
var ground = Mesh.CreateGround("ground1", 1000, 1000, 0, scene);

// Affect a material
ground.material = groundMat;

const lines = []

const buildingMat = new StandardMaterial("mat1", scene);
buildingMat.alpha = 1;
buildingMat.diffuseColor = new Color3(1, 1, 1);
buildingMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
buildingMat.backFaceCulling = false
const buildingTexture = new Texture('./building.png', scene)
buildingTexture.vScale = 3
buildingTexture.uScale = 20
buildingMat.diffuseTexture = buildingTexture

const roadMat = new StandardMaterial("mat2", scene);
roadMat.alpha = 1;
roadMat.diffuseColor = new Color3(0.5, 0.5, 0.5)
roadMat.specularColor = new Color3(0, 0, 0)
roadMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
roadMat.backFaceCulling = false
const roadTexture = new Texture('./road.png', scene)
roadTexture.vScale = 1
roadTexture.uScale = 20
roadMat.diffuseTexture = roadTexture

ways.forEach(way => {
    const points = way.points.map( point => new Vector3(point.x, 0.1, point.y))
    const path3D = new Path3D(points);
    const normals = path3D.getNormals();
    const curve = path3D.getCurve();
    
    const left = curve.map ((p,i) => p.add(normals[i].scale(4)))
    const right = curve.map ((p,i) => p.subtract(normals[i].scale(3)))
    // lines.push(MeshBuilder.CreateLines("ways", {points: curve}, scene))
    // lines.push(MeshBuilder.CreateLines("ways", {points: left}, scene))
    // lines.push(MeshBuilder.CreateLines("ways", {points: right}, scene))
    const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray: [right, left] },  scene )
    ribbon.material = roadMat
    // ribbon.receiveShadows = true;
})

buildings.forEach(way => {
    const floorPoints = way.points.map( point => new Vector3(point.x, 0.1, point.y))
    const roofPoints = way.points.map( point => new Vector3(point.x, way.levels * 3, point.y))

    // lines.push(MeshBuilder.CreateLines("floors", {points: floorPoints}, scene))
    // lines.push(MeshBuilder.CreateLines("roofs", {points: roofPoints}, scene))
    const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [floorPoints, roofPoints] },  scene )
    ribbon.material = buildingMat
    // shadowGenerator.getShadowMap().renderList.push(ribbon)

})


// ground.receiveShadows = true;

// SKYBOX

const skybox = MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
const skyboxMaterial = new StandardMaterial("skyBox", scene);
skyboxMaterial.backFaceCulling = false;
skyboxMaterial.reflectionTexture = new CubeTexture("./skybox", scene);
skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
skyboxMaterial.specularColor = new Color3(0, 0, 0);
skyboxMaterial.emissiveColor = new Color3(0.05, 0, 0)
skybox.material = skyboxMaterial;

// Render every frame
engine.runRenderLoop(() => {
    scene.render();
});