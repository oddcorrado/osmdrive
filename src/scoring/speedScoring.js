import score from './scoring'

let currentLimit = 130
let hasStarted = false
let interSpeed
let speedDivBg
let inter = {fast: null, slow: null, junc: null, stop: null, turnfast: null, juncslow: null}

//Check speed in circulation
function resetInterval(id){
    if (id){
        clearInterval(id);
        return null
    }
    return id;
}


function setSpeedAlert(speed){
    if (currentLimit < speed && !interSpeed) {
        speedDivBg.style.backgroundColor = interSpeed ? speedDivBg.style.backgroundColor : 'red';
        interSpeed = setInterval(() => {
            speedDivBg.style.backgroundColor = speedDivBg.style.backgroundColor == 'red' ? null : 'red';
        }, 500);
    } else if (speed < currentLimit){
        speedDivBg.style.backgroundColor = null;
        clearInterval(interSpeed);
        interSpeed = null;
    }
}

function speedingCheck(speed, approach){
    speedDivBg = speedDivBg ? speedDivBg : document.getElementById('speeddiv');
    setSpeedAlert(speed);
//console.log(approach)
    if (speed > currentLimit &&  (!approach || approach > 20 )) {
        if (!inter.fast){
            inter.fast = setInterval(() => {
                //score.newScore('SPEED_TOO_FAST', -10);
                score.newScore('speed', false);
            }, 5000)
        }
    } else if (hasStarted && speed > 0 && speed < (currentLimit*0.6) && (!approach || approach > 20 )) {   
        if (!inter.slow){
            inter.slow = setInterval(() => {
                score.newScore('speed', false);
            }, 5000)
        }
    } else {
        inter.slow = resetInterval(inter.slow);
        inter.fast = resetInterval(inter.fast);
    }
}

//Check speed in turns and intersections
function speedingIntersectionCheck(speed, approach){
    if (isTurning && speed>0.2){
        if (!inter.turnfast){
            inter.turnfast = setInterval(() => {
                //score.newScore('SPEED_TURN_TOO_FAST', -10);
            }, 1000)
        }
    } else
        inter.turnfast = resetInterval(inter.turnfast);
    if (approach < 3 && speed > 0.2)
        if (!inter.juncfast){
            inter.juncfast = setInterval(() => {
               // score.newScore('INTERSECTION_TOO_FAST', -10);
        }, 1000)
    } else
        inter.juncfast = resetInterval(inter.juncfast);
}

//Check useless stops
function stopCheck(speed, approach, hasStarted){
    if (speed > 0)  {
        inter.stop = resetInterval(inter.stop);
    }
    if (speed === 0 && hasStarted === true && (!approach || approach > 12 )){//+ pas de voiture devant
        if (!inter.stop){
            score.newScore('speed', false);
            inter.stop = setInterval(() => {
                score.newScore('speed', false);
            }, 5000)
        }
    }
}

export let setSpeedLimit = (speed) => {currentLimit = speed; console.log(speed)}

export default function speedScoring (speed, approach){
    hasStarted = !hasStarted && speed > 0 ? true : hasStarted;
    speedingCheck(speed*150, approach, hasStarted);
    //speedingIntersectionCheck(speed, approach);
    stopCheck(speed, approach, hasStarted);
    
}
