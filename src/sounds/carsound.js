import { Sound } from "@babylonjs/core/Audio/sound"
import audio from "@babylonjs/core/Audio/audioSceneComponent"
import { Engine } from "@babylonjs/core/Engines/engine"
import _ from '../enum/soundenum'
import { PlaySoundAction } from "@babylonjs/core/Actions"

var soundnb = 0
var speedSound = []
var old = {type: -1, vol: -1}
var togSound = false
let oldName = _.NONE;
let oldVol = -1;
let accelSound = false;
let blink
function addSound (){
    soundnb++
}

export function toggleSound(){
    togSound = !togSound
    if (togSound === false) {
        if (oldName != _.NONE){
            speedSound[oldName].stop()
        }   
        old.type = _.NONE
    }
}

export function setSounds(scene){   
    var idle = new Sound('idle', '../music/idle.wav', scene,  addSound, {loop: true}) 
    var low = new Sound('low', '../music/low.wav', scene,  addSound, {loop: true}) 
    var medium = new Sound('med', '../music/medium.wav', scene, addSound, {loop: true})
    var high = new Sound('high', '../music/high.wav', scene, addSound, {loop: true})
    blink = new Sound('high', '../music/blinker.wav', scene, addSound, {loop: true})

    speedSound.push(idle)
    speedSound.push(low)
    speedSound.push(medium)
    speedSound.push(high)
    speedSound[_.MEDIUM].setVolume(0.3)
    blink.setVolume(0.05)
}

export function playAccel(isAccel){
    if (togSound){
        // if (!accelSound && isAccel){//COMMENTER POUR ENLEVER LE SON
        //     speedSound[_.LOW].play()
        //     accelSound = true
        // } else if (accelSound && !isAccel){
        //     speedSound[_.LOW].stop()
        //     accelSound = false
        // }   //JUSQU'ICI
    }
}

export function playEngine(name, vol){
    if (togSound && (name != oldName || vol != oldVol)){
        if (name != oldName){//COMMENTER POUR ENLEVER LE SON
            if (oldName != _.NONE)
                speedSound[oldName].stop()
            speedSound[name].play()
        }
        speedSound[name].setVolume(vol)
        oldVol = vol;
        oldName = name;//JUSQU'ICI
    }
}

export function toggleBlinkerSound(play){
    if (play === false){
        blink.stop()
    } else if (play === true){
        blink.play()
    }
}

// export function oldPlaySound(name, vol){

//   if (togSound === true) {
//     if (name != old.type) {
//         if (old.type != _.NONE)
//             speedSound[old.type].stop()
//         speedSound[name].play()
//     } 
//         speedSound[name].setVolume(vol)
//         old.vol = vol
//         old.type = name
//     }
// }
