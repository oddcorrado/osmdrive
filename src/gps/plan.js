import arrowCreator from '../creators/gpsCreator'
import score from '../scoring/scoring'
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Quaternion } from 'cannon';
import createArrow from '../props/3darrow'

let prev;
let rotations = [{S: -Math.PI/10, L: 0, R: 0, E: 0},
                {S: 0, L: -Math.PI/2, R: Math.PI/2, E: 0},
                {S: 0, L: Math.PI/10, R: -Math.PI/10, E: 0}];
let imageSources = {
    S: '../../images/straight.svg',
    L: '../../images/leftturn.svg',
    R: '../../images/rightturn.svg',
    E: '../../images/park.svg'
}


let idx = 1;
let plan = ['I','S', 'R', 'L', 'L', 'S', 'L', 'R', 'S', 'L', 'S', 'S', 'S', 'S', 'E'];
let arrow;

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
}

export function setupGps(scene, container){
    //createArrow(scene, container);
    arrow = document.getElementById('gps');
}

let prevNormal;

export function gpsCheck(current, car, dir, gps, angle){
    prevNormal = prevNormal ? prevNormal : current[1];

    // gps.position = new Vector3(car.position.x + (dir.x > 0 ? 4 : dir.x < 0 ? -4 : 0), -0.2, car.position.z + (dir.z > 0 ? 4 : dir.z < 0 ? -4 : 0))
    // gps.rotation = new Vector3(rotations[0][plan[idx]], angle+rotations[1][plan[idx]], rotations[2][plan[idx]]);
    if (current[1].type == 'normal' && prevNormal != current[1]){
        checkJunctionGps(current, prevNormal)
        prevNormal = current[1];
    }
}




