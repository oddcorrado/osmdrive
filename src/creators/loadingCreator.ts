
export function createStartScreen(){
    const div: string = `<div id='startscreen'  style='width: 100%; height: 100%; background-color: white; z-index: 100;  position: fixed; font-weight: 800; top: 0; left: 0; font-size: 12vh; font-family: Asap Condensed; color: black; display: block; align-items: center; justify-content: center; text-align: center;'>
            <img src='../../images/carloading.svg' style='width: 10%; display: block; margin-top: 17%; margin-left: 45% '></img>
            <div id='startdiv'>
                Ubiquity
            </div>
            <button id='startbutton' style='box-shadow: 0px 0.5vh 1.2vh rgba(0,0,0,0.14); border: none;font-family: Poppins; font-style: normal; background-color: #FFEC00; border-radius: 10px; margin-top:5%; font-weight: 500; height: 8%; width: 10%;font-size: 3vh;'>
                Lancer
            </button>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
    return {start: document.getElementById('startdiv'), btn: document.getElementById('startbutton')}
}

export function createLoading(){
    const div: string = `<div id='customLoadingScreenDiv' style='width: 100%; height: 100%; background-color: white; z-index: 100;  position: fixed; font-weight: 800; top: 0; left: 0; font-size: 12vh; font-family: Asap Condensed; color: black; display: block; align-items: center; justify-content: center; text-align: center;'>
            <img src='../../images/carloading.svg' style='width: 6%; display: block; margin-top: 19%; margin-left: 47% '></img>
            <div id='loadtext' style='font-size: 3.5vh; width: 30%; margin-left: 35%; margin-top: 1%'>
                Chargement ...
            </div>
            <div style='width: 40%; margin-left: 30%; margin-top: 2%;height: 7%; background-color: grey; border-radius: 10px'>
                <div id='loadbar' style='height:100%; width: 0%;  border-radius: 10px; background-color: #dadada; background: linear-gradient(90deg, #FFEC00 0%, #EDBD31 100%)'></div>
            </div>
            </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
    return {loadtext: document.getElementById('loadtext'), loadbar: document.getElementById('loadbar')}
}


export function createEndOfLevel(){
    const div:string = `
    <div style='position: absolute; top: 18%; left: 30.5%; width: 37%; height: 40%; font-family: Asap Condensed; background-color: rgba(255,255,255,0.7); font-size: 5vh; text-align: center; border-radius: 1vh; box-shadow: -1px 2px 7.2px 1.8px rgba(0, 0, 0, 0.15)'>
        <div style='position: relative; top: -10%; height: '>
            <img src='../../images/congrats.svg'></img>
        </div>
        <div style='width: 70%; margin-left: 15%'>
            Parcours terminé.\nFélicitations!
        </div>
        <button id='reload' style='box-shadow: 0px 0.5vh 1.2vh rgba(0,0,0,0.14); width: 35%; height:25%;border: none;font-family: Poppins; font-style: normal; background-color: #FFEC00; border-radius: 10px; margin-top:5%; font-weight: 500; font-size: 3vh'>
            Relancer
        </button>
    </div>`
    
    document.body.insertAdjacentHTML('afterbegin', div)
    document.getElementById('reload').addEventListener('click', () => {
        document.location.reload()
    })
}