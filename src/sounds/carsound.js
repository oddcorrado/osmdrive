import { Sound } from "@babylonjs/core/Audio/sound"
import audio from "@babylonjs/core/Audio/audioSceneComponent"
import { Engine } from "@babylonjs/core/Engines/engine";
import _ from '../enum/soundenum'

var soundnb = 0;
var speedSound = [];
var old = {type: -1, vol: -1};
var togSound = false

function addSound (){
    soundnb++;
}

export function toggleSound(){
    togSound = !togSound;
    if (togSound === false) {
        speedSound[old.type].stop();
        old.type = _.NONE;
    }
}

export function setSounds(scene){   
    var low = new Sound('low', '../music/low.wav', scene,  addSound, {loop: true}); 
    var medium = new Sound('med', '../music/medium.wav', scene, addSound, {loop: true});
    var high = new Sound('high', '../music/high.wav', scene, addSound, {loop: true});

    speedSound.push(low);
    speedSound.push(medium);
    speedSound.push(high);
}

export function playSound(name, vol){
  if (togSound === true) {
      console.log('plays');
    if (name != old.type) {
        if (old.type != _.NONE)
            speedSound[old.type].stop();
        speedSound[name].play();
    } 
        speedSound[name].setVolume(vol)
        old.vol = vol;
        old.type = name;
    }
}
