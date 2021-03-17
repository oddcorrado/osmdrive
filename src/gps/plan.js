import arrowCreator from '../creators/gpsCreator'
import score from '../scoring/scoring'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { Quaternion } from 'cannon'
import {createEndOfLevel} from '../creators/loadingCreator'
import {setGameState} from '../controls/loops'

let imageSources = {
    S: '../../images/straight.svg',
    L: '../../images/leftturn.svg',
    R: '../../images/rightturn.svg',
    E: '../../images/park.svg',
}


let idx = 1

let plan = ['I','S', 'R', 'S', 'L', 'R', 'S', 'L', 'S', 'R', 'L', 'E']
let arrow

function checkJunctionGps(current, prev){
    if (plan[idx] === 'S'){
        if (current[1].roadIndex === prev.roadIndex)
            score.newScore('RIGHT_TURN', 20)
        else
            score.newScore('WRONG_TURN', -20)
    } else if (plan[idx] === 'L') {
        if (current[0].nexts[1] && current[0].nexts[1].roadIndex === current[1].roadIndex)
            score.newScore('RIGHT_TURN', 20)
        else 
            score.newScore('WRONG_TURN', -20)
    } else if (plan[idx] === 'R'){
        if (current[0].nexts[0] && current[0].nexts[0].roadIndex === current[1].roadIndex)
            score.newScore('RIGHT_TURN', 20)
        else 
            score.newScore('WRONG_TURN', -20)
    } 
    idx = plan[idx] === 'E' ? idx : idx+1;
    arrow.src = imageSources[plan[idx]];
    if (plan[idx] ==='E'){
        setTimeout(() => {setGameState('end'); createEndOfLevel()}, 2000)
    }
}

export function getNextTurn(){
    let next = plan[idx]
    next = next === 'L' || next === 'R' ? next : null
    return next
}

export function setupGps(scene, container){
    //createArrow(scene, container);
    arrow = document.getElementById('gps');
}

let prevNormal;

export function gpsCheck(current, car, dir, gps, angle){
    if (current){
        prevNormal = prevNormal ? prevNormal : current[1]

        // gps.position = new Vector3(car.position.x + (dir.x > 0 ? 4 : dir.x < 0 ? -4 : 0), -0.2, car.position.z + (dir.z > 0 ? 4 : dir.z < 0 ? -4 : 0))
        // gps.rotation = new Vector3(rotations[0][plan[idx]], angle+rotations[1][plan[idx]], rotations[2][plan[idx]]);
        if (current[1].type == 'normal' && prevNormal != current[1]){
            checkJunctionGps(current, prevNormal)
            prevNormal = current[1]
        }
    }
}




