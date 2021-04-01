export function scoreDivCreator(){
    const div: string = ` <div style='display: block; height: 12vh;  font-family: "Asap Condensed", sans serif; font-weight: 700; font-size: 6vh; border-bottom-left-radius: 6vh;position: absolute; top: 0; right: 0; width: 15vw; background-color: #262626; color: white;'>
         <div style='float: left; margin-left: 2vw; margin-top: 2vh'>
             <img style='height: 4.5vh' src='../../images/star.svg'></img>
         </div>
         <div id='score' style='float: left; margin-left: 2vw; margin-top: 1.8vh; height: 100%'>
             0
         </div>
     </div>`
     document.body.insertAdjacentHTML('afterbegin', div);
    
} 

export function tapButtonCreator(){
    const div: string = `
    <div style='display: block'>
        <div style="position: absolute;
            bottom: 4vh;
            right: 0vh;
            z-index: 10;
            width: 25vw;
            height: 30vh;
            display: flex;
            flex-direction: row-reverse;">
            <div style='width: 15vw'>
                <img draggable=false id='accel' style="height: 30vh; width: 12vw; opacity:0.9" src='../../images/accel.svg'></img>
            </div>
            <div style='width: 13vw'>
                <img draggable=false id='brake' style="height: 17vh; width: 14vw; margin-top: 13vh; opacity:0.9" src='../../images/brake.svg'></img> 
            </div>
        </div>
    </div>`

    document.body.insertAdjacentHTML('afterbegin', div);

}

export function viewZoneCreator(){
    const div: string =
    `<div id='view' style='display: none;position: absolute; z-index:10;bottom: 50vh; left: 6vw; width: 24vw; height: 20vh; text-align: center'>
        <div style='margin-top: 5vh'>
            <img draggable=false style='height: 10vh; width: 24vw; text-align:center;' src='../images/arrow.svg'></img>
        </div>
        <div id='look-eye' style='position:relative; left: 0vh;bottom: 15.2vh;'>
            <img draggable=false style='height: 19vh; width: 10vw' src='../images/centerview.svg'></img>
        </div>
    </div>`
   // return div;
    document.body.insertAdjacentHTML('afterbegin', div);
}

export function leftViewCreator(){
    const div: string = 
   ` <div id='leftview' style='position: absolute; top: 31vh; left: 1vw; height: 20vh; width: 20vw; z-index: 12;'>
        <div style='display: inline; position: relative; top: 0vh; left: 5vw;'>
            <img draggable=false src='../images/arrowview.svg' style='height: 19vh; width: 10vw; draggable=false'></img>
        </div>
        <div id='leftviewimg' style='display: inline; position: relative; top: -0.9vh; left: 0vw'>
            <img src='../images/look.svg' style='height: 17vh; width: 9vw;' draggable=false></img>
        </div>
    </div>`
    
    document.body.insertAdjacentHTML('afterbegin', div);
}

export function rightViewCreator(){
    const div: string = 
   ` <div id='rightview' style='position: absolute; top: 31vh; right: 1vw; height: 20vh; width: 20vw; z-index: 11;'>
        <div style='display: inline; position: relative; top: 0vh; left: 5vw;'>
            <img draggable=false src='../images/arrowview.svg' style='transform: rotateY(180deg); height: 19vh; width: 10vw'></img>
        </div>
        <div id='rightviewimg' style='display: inline; position: relative; top: -0.9vh; right: 10vw'>
            <img draggable=false src='../images/look.svg' style='transform: rotateY(180deg); height: 17vh; width: 9vw;'></img>
        </div>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
}


export function wheelCreator(){
    const div: string =
    `<div id='wheelzone' style='position: absolute; z-index: 10; bottom: 5vh; left: 0; height:40vh; width: 37vw; text-align: center; align-item: center'>
        <img draggable=false id='wheelimg' src='../images/wheelcuir.svg' style='height: 40vh; width: 37vw;'></img>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
}

export function wheelLockedCreator(){
    const div: string =
        `<div style='text-align: center'>
            <img draggable=false id='wheellocked' src='../images/wheellocked.svg' style='display: none; z-index: 11;position: absolute; bottom: -1vh; left: 1vw; height: 55vh; width: 35vw; opacity: 0.8'></img>
        </div>`

    document.body.insertAdjacentHTML('afterbegin', div)
}


//NEW UI FROM HERE

export function dashboardCreator(){
    const div: string = 
   ` <div style='position: absolute; bottom:0vh; left: 35vw; width: 30vw; height: 21vh; text-align: center; color: white; background: url("../images/dashboard.svg") no-repeat bottom; background-size:contain; font-family: Microbrew Soft One, sans-serif';'>
            <div id='speeddiv' style=' rgba(0.25, 0.25, 0.25, 0.5); border-radius: 8vh; height: 45%; width: 22%; margin-top: 5%; margin-left: 39%'>
                <div id='speed' style='text-align: center; display: inline-block ;height: 90%;font-size: 8.5vh; font-weight: 400' id='speed'>0</div>    
            </div> 
            <div style='position: relative; right: 17%; bottom: 5%' id='next-turn'>
                <img id='gps' style='height: 6vh; width: auto' src='../../images/straight.svg'></img>
            </div>
            <div style='position: relative; left: 18%; bottom: 45%'>
                <img id='speedlimit' style='height: 9vh; width: auto;' src='../../images/30.svg'></img>
            </div>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
}

export function blinkerCreator(){
    const div: string =`
    <div style='display: block; position: absolute; bottom: 10vh; left: 32.5%; width: 35%;z-index: 11; '>
        <div id='lblink' style='float: left; display: inline-block; height: 14vh; width: 10vw;'>
            <img id='lblinkimg' src='../images/blinkdef.svg' style='height: 14vh; width: 10vw;'></img>
        </div>
        <div id='rblink' style='float: right; transform: rotateY(180deg); height: 14vh; width: 10vw; display: inline-block'>
            <img id='rblinkimg' src='../images/blinkdef.svg' style='height: 14vh; width: 10vw'></img>
        </div>
    </div>
   `
   document.body.insertAdjacentHTML('afterbegin', div)
     
}

export function centralMirrorCreator(){
    const div: string =`
    <div style='position: absolute; top: 2.4vh; left: 31vw; height: 23vh; width: 37vw; z-index: 11; border-radius: 3vh; border: black solid 0.9vw;'>
        <canvas id='centralmirror'></canvas>
    </div>
   `
   document.body.insertAdjacentHTML('afterbegin', div)
}

export function speedButtonCreator(){
    const div: string = 
   `<div id='acceldiv' style='position: absolute; bottom: 4vh; right:2vw; border: solid white 0.3vw; height: 50vh; width: 5vw;border-radius: 10vh; text-align: center; background: linear-gradient(0deg , rgba(86, 241, 82, 0) 0%,  #56F152 15%, rgba(0,0,0,0) 15%, rgba(0,0,0,0) 100%)'>
        <img draggable=false id='accelslide' style='z-index: 11;position: relative; width: 55%; top: 70%;' src='../images/accelslide.svg'></img>
    </div>
   <div id='brakediv' style='position: absolute; bottom: 4vh; right: 9vw; border: solid white 0.3vw; height: 35vh; width: 5vw; border-radius: 10vh; text-align: center; background: linear-gradient(0deg,  rgba(255, 0, 0, 0) 0% , #FF0000 15%, rgba(0,0,0,0) 15%,  rgba(0,0,0,0) 100%)'>
        <img draggable=false  id='brakeslide' style='position: relative; top: 70%; z-index: 11; width: 80%;' src='../images/brakeslide.svg'></img>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
    
}

export function viewCreator(){
    const div: string = 
        `<div id='viewdiv' style='position: absolute; bottom: 20vh; left: 5vw; height: 40vh; width: 40vh; border-radius: 50%; border: solid 0.1vw #C4C4C4'>
            <div style='width: 50%; height: 100%; border-right: 0.1vw solid #C4C4C4'>
                <img draggable=false id='viewdrag' src='../images/Vcenter.svg' style='z-index: 11; height: 30%; width: 30%; margin-left: 85%; margin-top: 70%'></img>
            </div>
        </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
}