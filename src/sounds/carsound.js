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
function addSound (){
    soundnb++
}

export function toggleSound(){
    togSound = !togSound
    if (togSound === false) {
        if (oldName != _.NONE){
            speedSound[oldName.type].stop()
        }   
        speedSound[_.MEDIUM].stop()
        speedSound[_.IDLE].stop()
        old.type = _.NONE
    }
}

export function setSounds(scene){   
    var idle = new Sound('idle', '../music/idle.wav', scene,  addSound, {loop: true}) 
    var low = new Sound('low', '../music/low.wav', scene,  addSound, {loop: true}) 
    var medium = new Sound('med', '../music/medium.wav', scene, addSound, {loop: true})
    var high = new Sound('high', '../music/high.wav', scene, addSound, {loop: true})
    
    speedSound.push(idle)
    speedSound.push(low)
    speedSound.push(medium)
    speedSound.push(high)
    speedSound[_.MEDIUM].setVolume(0.6)
}

export function playAccel(isAccel){
    if (togSound){
        if (!accelSound && isAccel){
            speedSound[_.MEDIUM].play()
            accelSound = true
        } else if (accelSound && !isAccel){
            speedSound[_.MEDIUM].stop()
            accelSound = false
        }   
    }
}

export function playEngine(name, vol){
    if (togSound && (name != oldName || vol != oldVol)){
        if (name != oldName){
            if (oldName != _.NONE)
                speedSound[oldName].stop()
            speedSound[name].play()
        }
        speedSound[name].setVolume(vol)

        oldVol = vol;
        oldName = name;
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
