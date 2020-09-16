import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Vector3} from '@babylonjs/core/Maths/math'
import { getWayDir } from './way'
import { TupleDictionary } from 'cannon';

function getRandomPosition(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
  }
  
function turn(bot, angle){
    var axis = new Vector3(0,1,0)
    for (var i = 0; i <= Math.PI / 4; i = i+0.1){
        bot.rotation = new Vector3(0, i + bot.rotation.y, 0)
        var speed = new Vector3(2*Math.cos(Math.PI/4), 0, 5 * Math.sin(Math.PI/4))
        bot.physicsImpostor.setLinearVelocity(speed);
    }
/*
    var quaternion = new Quaternion.RotationAxis(axis, angle);
    bot.rotationQuaternion = quaternion;
    */
}

function createBots(scene){
    var botsTab = [];

    for (var i = 0; i <= 10; i++){
        botsTab.push(MeshBuilder.CreateBox('box', {height: 4, width: 2, depth: 4 }, scene));
        botsTab[i].position.y = 2;
        botsTab[i].position.z = getRandomPosition(-150, 150);
        botsTab[i].position.x = getRandomPosition(-150, 150);
        console.log('made x: ', botsTab[i].position.x, '  z: ', botsTab[i].position.z);
    }

    return botsTab;
}

function loop(bots) {
    var angle;
    bots.forEach(bot => {
        if (Math.random() * 1000 <= 20) {
            if (Math.random() * 2 < 1) {
                angle = Math.PI / 8;
            } else {
                angle = -Math.PI / 8;
            }
            turn(bot, angle);
        }
       // const newVel = new Vector3(adjustSpeed * Math.cos(angle), vel.y , adjustSpeed * Math.sin(angle))
       const newVel = new Vector3(0, 0 , 5)

        bot.physicsImpostor.setLinearVelocity(newVel)
    })
}


export default {
    createBots: scene => createBots(scene),
    loop: bots => loop(bots)
}