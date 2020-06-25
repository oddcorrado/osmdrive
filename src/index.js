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
    Mesh
} from "@babylonjs/core/Meshes/mesh";

import {
    StandardMaterial
} from "@babylonjs/core/Materials/standardMaterial";

// import { Vector3 } from '@babylonjs/core/Maths/math.vector' 

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Path3D } from '@babylonjs/core/Maths/math.path'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { ways, buildings } from './map'

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
var light = new HemisphericLight("light1", new Vector3(0, 100, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Create a grid material
var material = new StandardMaterial("grid", scene);

// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);

// Move the sphere upward 1/2 its height
sphere.position.y = 2;

// Affect a material
sphere.material = material;

const groundMat = new StandardMaterial("groundMat", scene);
groundMat.alpha = 1;
groundMat.diffuseColor = new Color3(0, 0, 0);
groundMat.emissiveColor = new Color3(0.2, 0.2, 0.2);
groundMat.backFaceCulling = false;

// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
var ground = Mesh.CreateGround("ground1", 1000, 1000, 0, scene);

// Affect a material
ground.material = groundMat;


const lines = []


const mat = new StandardMaterial("mat1", scene);
mat.alpha = 1;
mat.diffuseColor = new Color3(0.5, 0.5, 1.0);
mat.emissiveColor = new Color3.Gray();
mat.backFaceCulling = false;
    
ways.forEach(way => {
    const points = way.points.map( point => new Vector3(point.x, 0.1, point.y))
    const path3D = new Path3D(points);
    const normals = path3D.getNormals();
    const curve = path3D.getCurve();
    
    const left = curve.map ((p,i) => p.add(normals[i].scale(4)))
    const right = curve.map ((p,i) => p.subtract(normals[i].scale(3)))
    lines.push(MeshBuilder.CreateLines("ways", {points: curve}, scene))
    lines.push(MeshBuilder.CreateLines("ways", {points: left}, scene))
    lines.push(MeshBuilder.CreateLines("ways", {points: right}, scene))
    const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray: [left, right] },  scene )
    ribbon.material = mat
})

buildings.forEach(way => {
    const floorPoints = way.points.map( point => new Vector3(point.x, 0.1, point.y))
    const roofPoints = way.points.map( point => new Vector3(point.x, way.levels * 3, point.y))

    lines.push(MeshBuilder.CreateLines("floors", {points: floorPoints}, scene))
    lines.push(MeshBuilder.CreateLines("roofs", {points: roofPoints}, scene))
    const ribbon = MeshBuilder.CreateRibbon("building", { pathArray: [floorPoints, roofPoints] },  scene )
    ribbon.material = mat
})

// Render every frame
engine.runRenderLoop(() => {
    scene.render();
});