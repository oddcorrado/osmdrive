export default function arrowCreator(){
    var tmpDiv: HTMLElement = document.createElement('div');
    var tmpImg: HTMLImageElement = document.createElement('img');

    tmpDiv.setAttribute('style', 'position: absolute; width:10vw; top: 10vh; left: 45vw; height: 10vh;');
    tmpImg.setAttribute('style', 'width: 10vw; height: 10vh');

    tmpImg.src = '../../images/gps.svg';
    tmpDiv.appendChild(tmpImg);
    document.body.appendChild(tmpDiv);
    return tmpImg;
}