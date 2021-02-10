
export function createStartScreen(){
    let div = `<div id='startscreen'  style='width: 100%; height: 100%; background-color: white; z-index: 10;  position: fixed; font-weight: 800; top: 0; left: 0; font-size: 12vh; font-family: Asap Condensed; color: black; display: block; align-items: center; justify-content: center; text-align: center;'>
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
    let div = `<div id='customLoadingScreenDiv' style='width: 100%; height: 100%; z-index: 1000; background-color: white; z-index: 10;  position: fixed; font-weight: 800; top: 0; left: 0; font-size: 12vh; font-family: Asap Condensed; color: black; display: block; align-items: center; justify-content: center; text-align: center;'>
            <img src='../../images/carloading.svg' style='width: 7%; display: block; margin-top: 17%; margin-left: 45% '></img>
            <div id='loadtext'>
                Chargement ...
            </div>
            <div style='width: 40%; height: 7%; background-color: #dadada; border-radius: 10px'>
                <div id='loadbar' style='height:100%; background: linear-gradient(90deg, #FFEC00 0%, #EDBD31 100%)'></div>
            </div>
            </div>`
    document.body.insertAdjacentHTML('afterbegin', div)
    return {loadtext: document.getElementById('loadtext'), loadbar: document.getElementById('loadbar')}
}
