import  '@babylonjs/loaders/OBJ'
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { Vector3, Axis, Space, Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import physics from '../physics'
import { PhysicsImpostor} from '@babylonjs/core/Physics/physicsImpostor'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MotorEnabledJoint, HingeJoint, PhysicsJoint } from '@babylonjs/core/Physics/physicsJoint';

function createBody(scene, camera, internalCamera, container){
    return new SceneLoader.ImportMeshAsync('', "../mesh/Clio/body/", "body.obj", scene).then(function(newMesh) { 
      var car = Mesh.MergeMeshes(newMesh['meshes'], true, true, null, false, true);
      car.name = 'clio';
      car.physicsImpostor = new PhysicsImpostor(car, PhysicsImpostor.BoxImpostor, {
        mass: 2,
        friction:0.5,
        restitution: 10,
        nativeOptions: {
          noSleep: true,
          move: true
        }
      })
   
     //car.isVisible = false;
      var exactPos = {x: car.getBoundingInfo().boundingBox.centerWorld._x,z: car.getBoundingInfo().boundingBox.centerWorld._z};
      var exactSiz = {x: car.getBoundingInfo().boundingBox.extendSize._x,z: car.getBoundingInfo().boundingBox.extendSize._z};
      createHolders(scene, container, exactPos, exactSiz, car)
      container.meshes.push(car);
   //   car.scalingDeterminant = 0.8;
      // camera.parent = car;
      // internalCamera.parent = car;
      container.meshes.push(car);
    })
}

function createHolders(scene, container, carpos, size, car){
  var suspensions = []
  var mats = [
  new StandardMaterial("red", scene),
  new StandardMaterial("blue", scene),
  new StandardMaterial("green", scene),
  new StandardMaterial("purple", scene),
]
  mats[0].diffuseColor = new Color3(1, 0, 0);
  mats[1].diffuseColor = new Color3(0, 0, 1);
  mats[2].diffuseColor = new Color3(0, 1, 0);
  mats[3].diffuseColor = new Color3(1, 0, 1);
  var pos = [
    new Vector3(carpos.x + size.x/2 + 0.4, 2, carpos.z - size.z/2),//FRONT LEFT RED
    new Vector3(carpos.x - size.x/2 - 0.4, 2, carpos.z - size.z/2),//FRONT RIGHT BLUE
    new Vector3(carpos.x + size.x/2 + 0.4, 2, carpos.z + size.z/2 + 0.35),//BACK LEFT GREEN
    new Vector3(carpos.x - size.x/2 - 0.4, 2, carpos.z + size.z/2 + 0.35)//BACK RIGHT PURPLE
  ]
  var holder = MeshBuilder.CreateBox("holder0", {
    height: 0.5,
    width: 0.2,
    depth: 0.2
  }, scene)
  suspensions.push(holder);
  for (var i = 1; i < 4; i++){
    suspensions.push(holder.clone());
    suspensions[i].name = `holder${i}`
  }
  suspensions.forEach((susp, i = 0) => {
    susp.material = mats[i];
    susp.position = pos[i];
   // susp.isVisible = false;
    susp.physicsImpostor = new PhysicsImpostor(susp, PhysicsImpostor.SphereImpostor, {
      mass: 8,
      friction: 4,
      restitution: 0.5
  });

 // susp.physicsImpostor.physicsBody.collidesWith = ~1;
  // susp.physicsImpostor.collisionGroup = 0;
  // susp.physicsImpostor.collisionMask = 0;
  //susp.collisionMask = 4;
  })
  createWheels(scene, container, pos,suspensions, car);
}

function createWheels(scene, container, pos, suspensions, car){
  return new SceneLoader.ImportMeshAsync('', "../mesh/Clio/wheel/", "wheel.obj", scene).then(function(newWheelL) { 
      //new SceneLoader.ImportMeshAsync('',  "../mesh/Clio/wheelR/", "wheelR.obj", scene).then(function(newWheelR) { 
     var wheelpos = [];
     var wheeltab = [];
     var tmpW;
     var wheelFL = Mesh.MergeMeshes(newWheelL['meshes'], true, true, null, false, false);

    pos.forEach(pos => {
      wheelpos.push(new Vector3(pos.x, 1, pos.z))
    })  
//    var wheelFR = Mesh.MergeMeshes(newWheelR['meshes'], true, true, null, false, false);
    wheelFL.position = wheelpos[0];
    /*
    wheelFR.position = wheelpos[1];
    var wheelBL = wheelFL.clone();
    wheelBL.position = wheelpos[2];
    var wheelBR = wheelFR.clone();
    wheelBL.position = wheelpos[3];
    wheeltab.push(wheelFL, wheelFR, wheelBL, wheelBR);
    */
    setWheelPhysic(wheelFL);
    wheeltab.push(wheelFL)
    for (var i = 1; i<4; i++){
      tmpW = wheelFL.clone();
      //wheeltab[i].id = `wheel${i}`;
      tmpW.id = `wheel${i}`;
      //setWheelPhysic(wheeltab[i])
      tmpW.position = wheelpos[i];
      wheeltab.push(tmpW);
      // if (i === 1 || i === 3){
      //   tmpW.rotation = new Vector3(0, 0, Math.PI);
      // }
     }
    
    createJoints(suspensions, wheeltab, pos, car, container)
    //})   
  })
}

function setWheelPhysic(wheel){
  wheel.physicsImpostor = new PhysicsImpostor(wheel, PhysicsImpostor.SphereImpostor,{
    mass: 100,
    friction: 10,
    restitution: 0.5,
    nativeOptions: {
      move: true
    }
  })
}

function createJoints(susp, wheeltab, pos, car, container){
  var sJoint1 = new MotorEnabledJoint(PhysicsJoint.SliderJoint, {
    mainPivot: new Vector3(pos[0].x, -0.2, pos[0].z-0.2),
    mainAxis: new Vector3(0, -1, 0),
    connectedAxis: new Vector3(0, -1, 0),
    collision: false,
    nativeParams: {
        limit: [0, 0],
        spring: [100, 2],
        min: 5,
        max: 30
    }
  });
  car.physicsImpostor.addJoint(susp[0].physicsImpostor, sJoint1);

  var sJoint2 = new MotorEnabledJoint(PhysicsJoint.SliderJoint, {
    mainPivot:new Vector3(pos[1].x, -0.2, pos[1].z-0.2),
    mainAxis: new Vector3(0, -1, 0),
    connectedAxis: new Vector3(0, -1, 0),
    collision: false,
    nativeParams: {
        limit: [0, 0],
        spring: [100, 2],
        min: 5,
        max: 30
    }
  });
  car.physicsImpostor.addJoint(susp[1].physicsImpostor, sJoint2);

  var sJoint3 = new MotorEnabledJoint(PhysicsJoint.SliderJoint, {
    mainPivot: new Vector3(pos[2].x, -0.2, pos[2].z),
    mainAxis: new Vector3(0, -1, 0),
    connectedAxis: new Vector3(0, -1, 0),
    collision: false,
    nativeParams: {
        limit: [0, 0],
        spring: [100, 2],
        min: 5,
        max: 30
    }
  });
  car.physicsImpostor.addJoint(susp[2].physicsImpostor, sJoint3);

  var sJoint4 = new MotorEnabledJoint(PhysicsJoint.SliderJoint, {
    mainPivot: new Vector3(pos[3].x, -0.2, pos[3].z),
    mainAxis: new Vector3(0, -1, 0),
    connectedAxis: new Vector3(0, -1, 0),
    collision: false,
    nativeParams: {
        limit: [0, 0],
        spring: [100, 2],
        min: 5,
        max: 30
    }
  });
  car.physicsImpostor.addJoint(susp[3].physicsImpostor, sJoint4);
  
  //Joint wheel 
  var joint1 = new HingeJoint({
     mainPivot: new Vector3(0, -0.5, 0),
     connectedPivot: new Vector3(-0.5, 0, 0),
     mainAxis: new Vector3(-1, 0, 0),
     connectedAxis: new Vector3(-1, 0, 0),
     collision: false,
     nativeParams: {
       limit: [0, 0]
     }
   });
 susp[0].physicsImpostor.addJoint(wheeltab[0].physicsImpostor, joint1);

 var joint2 = new HingeJoint({
   mainPivot: new Vector3(0, -0.5, 0),
   connectedPivot: new Vector3(0.5, 0, 0),
   mainAxis: new Vector3(-1, 0, 0),
   connectedAxis: new Vector3(-1, 0, 0),
   collision: false,
   nativeParams: {
     limit: [0, 0]
   }
 });
 susp[1].physicsImpostor.addJoint(wheeltab[1].physicsImpostor, joint2);

var joint3 = new HingeJoint({
  mainPivot: new Vector3(0, -0.5, 0),
  connectedPivot: new Vector3(-0.5, 0, 0),
  mainAxis: new Vector3(-1, 0, 0),
  connectedAxis: new Vector3(-1, 0, 0),
  collision: false,
  nativeParams: {
    limit: [0, 0]
  }
});
susp[2].physicsImpostor.addJoint(wheeltab[2].physicsImpostor, joint3);

 var joint4 = new HingeJoint({
  mainPivot: new Vector3(0, -0.5, 0),
  connectedPivot: new Vector3(0.5, 0, 0),
  mainAxis: new Vector3(-1, 0, 0),
  connectedAxis: new Vector3(-1, 0, 0),
  collision: false,
  nativeParams: {
    limit: [0, 0]
  }
});
susp[3].physicsImpostor.addJoint(wheeltab[3].physicsImpostor, joint4);
sJoint1.setLimit(0, 0);
sJoint2.setLimit(0, 0);
sJoint3.setLimit(0, 0);
sJoint4.setLimit(0, 0);
car.position = new Vector3(0, 3, 0);

  container.meshes.push({name:'sjoints', sjoints: [sJoint1, sJoint2, sJoint3, sJoint4]}, {name:'joints', joints: [joint1, joint2, joint3, joint4]})
}


export function createMainCar (scene, camera, internalCamera, container) {
  createBody(scene, camera, internalCamera, container);
  //setupJoystick(scene)
}
