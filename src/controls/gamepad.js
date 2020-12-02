const gamepad = () => {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (gamepads == null) {
      return null
    }
  
    var gp = gamepads[0]
    if(gp == null) { return }
    return ({
        steer: gp.axes[0],
        look: gp.axes[2],
        speed: -gp.axes[3]
    })
}

export default gamepad