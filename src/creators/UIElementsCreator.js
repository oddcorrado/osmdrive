

export function scoreDivCreator(){
    var div = ` <div style='display: block; height: 12vh;  font-family: "Asap Condensed", sans serif; font-weight: 700; font-size: 6vh; border-bottom-left-radius: 6vh;position: absolute; top: 0; right: 0; width: 15vw; background-color: #262626; color: white;'>
         <div style='float: left; margin-left: 2vw; margin-top: 2vh'>
             <img style='height: 4.5vh' src='../../images/star.svg'></img>
         </div>
         <div id='score' style='float: left; margin-left: 2vw; margin-top: 1.8vh; height: 100%'>
             0
         </div>
     </div>`
     return div;
} 

export function dashboardCreator(){
    var div = 
       ` <div id='dashboard' style='position: absolute;
            bottom: -8vh;
            width: 14vw;
            height: 35vh;
            left: 43vw;
            border-radius: 4vw;
            background-color: rgba(0,0,0,0.7);
            color: white;
            font-family: Microbrew Soft One, sans-serif';
            >
            <div style='margin-top: 3vh; margin-left: 1vw; display: inline-block' id='next-turn'>
                <img id='gps' style='height: 7vh; width: 6vw' src='../../images/straight.svg'></img>
            </div>
            <div style='margin-top: 3vh; display: inline-block' id='next-turn'>
                <img id='gps' style='height: 7vh; width: 6vw' src='../../images/30.svg'></img>
            </div>
            <div id='speeddiv' style='text-align:center; rgba(0.25, 0.25, 0.25, 0.5); height: 40%; max-width:66%; margin-left: 17%; border-radius: 2vh; margin-top: 5%'>
                <div id='speed' style='text-align: center; display: inline-block ;height: 7vh;font-size: 8vh; font-weight: 400' id='speed'>0</div>    
                <div style='font-size: 3vh;color: white; margin-top: 0.5vh;font-weight: normal; opacity: 0.4;'>KM/H</div>
            </div> 
        </div>`
        return div;
}

export function tapButtonCreator(){
    var div = `
    <div>
        <div style="position: absolute;
            bottom: 4vh;
            right: 0vh;
            z-index: 10;
            width: 25vw;
            height: 30vh;
            display: flex;
            flex-direction: row-reverse;">
            <div style='width: 15vw'>
                <img draggable=false id='up' style="height: 30vh; width: 12vw; opacity:0.9" src='../../images/accel.svg'></img>
            </div>
            <div style='width: 13vw'>
                <img draggable=false id='down' style="height: 17vh; width: 14vw; margin-top: 13vh; opacity:0.9" src='../../images/brake.svg'></img> 
            </div>
        </div>
    </div>`

    return div;
}

export function viewZoneCreator(){
    var div =
    `<div id='view' style='position: absolute; z-index:10;bottom: 50vh; left: 6vw; width: 24vw; height: 20vh; text-align: center'>
        <div style='margin-top: 5vh'>
            <img draggable=false style='height: 10vh; width: 24vw; text-align:center;' src='../images/arrow.svg'></img>
        </div>
        <div id='look-eye' style='position:relative; left: 0vh;bottom: 15.2vh;'>
            <img draggable=false style='height: 19vh; width: 10vw' src='../images/centerview.svg'></img>
        </div>
    </div>`
    return div;
}

 export function rightViewCreator(){
//     var div = 
//     <div style='position: absolute; top: 20vh; left: 1vw'>
//         <div>
//             <img src='../images/arrowview.svg'></img>
//         </div>
//         <div>
//             <img src='../images/look.svg'></img>
//         </div>
//     </div>
}

export function wheelCreator(){
    var div =
    `<div id='wheelzone' style='position: absolute; z-index: 10; bottom: 5vh; left: 0; height:40vh; width: 37vw; text-align: center; align-item: center'>
        <img draggable=false id='wheelimg' src='../images/wheelcuir.svg' style='height: 40vh; width: 37vw;'></img>
    </div>`
     return div
}

export function wheelLockedCreator(){
    var div =
        `<div style='text-align: center'>
            <img draggable=false id='wheellocked' src='../images/wheellocked.svg' style='display: none; z-index: 11;position: absolute; bottom: -1vh; left: 0vw; height: 55vh; width: 35vw; opacity: 0.8'></img>
        </div>`
     return div
}

export function blinkerCreator(){
    var div =`
    <div style='position: absolute; bottom: 5vh; left: 32.5%; width: 35%;z-index: 11; '>
        <div id='lblink' style='float: left; display: inline-block; height: 14vh; width: 10vw;'>
            <img id='lblinkimg' src='../images/blinkdef.svg' style='height: 14vh; width: 10vw;'></img>
        </div>
        <div id='rblink' style='float: right; transform: rotateY(180deg); height: 14vh; width: 10vw; display: inline-block'>
            <img id='rblinkimg' src='../images/blinkdef.svg' style='height: 14vh; width: 10vw'></img>
        </div>
    </div>
   `
   return div 
}