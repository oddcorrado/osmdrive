import { Sound } from "@babylonjs/core/Audio/sound"
import audio from "@babylonjs/core/Audio/audioSceneComponent"
import { Engine } from "@babylonjs/core/Engines/engine";
import _ from '../enum/soundenum'

var soundnb = 0;
var speedSound = [];
var playType = -1;
var old = -1;

function addSound (){
    soundnb++;
}

export function setSounds(scene){   
    Engine.audioEngine.setGlobalVolume(0.5);
    
    var low = new Sound('low', '../music/low.wav', scene,  addSound, {loop: true}); 
    var medium = new Sound('med', '../music/medium.wav', scene, addSound, {loop: true});
    var high = new Sound('high', '../music/high.wav', scene, addSound, {loop: true});

    speedSound.push(low);
    speedSound.push(medium);
    speedSound.push(high);
    console.log('m', speedSound)
}
var play = 'none';
export function playSound(name, volume){
  //  console.log(name, old)
   
    if (play === 'none')
        speedSound[2].play();
    speedSound[2].setVolume(volume);
    play = 'yes'
return;
    if (playType == name)
        return;
    else {
        console.log(old, name)
        if (old != _.NONE)
            speedSound[old].stop()
        if (name != _.NONE) {
            speedSound[name].play();
            speedSound[name].setVolume(volume);
        }
        playType = name;
        old = name;
    }
}
