export default function arrowCreator(){
    var tmpDiv = document.createElement('div');
    var tmpImg = document.createElement('img');

    tmpDiv.setAttribute('style', 'position: absolute; width:10vw; top: 10vh; left: 45vw; height: 10vh;');
    tmpImg.setAttribute('style', 'width: 10vw; height: 10vh');

    tmpImg.src = '../../images/gps.svg';
    tmpDiv.appendChild(tmpImg);
    document.body.appendChild(tmpDiv);
    return tmpImg;
}