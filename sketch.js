var setup = () => {
    createCanvas(innerWidth,innerHeight)
    background(0,0,0)
}
var x = 0
var draw = () => {
    ctx.fillStyle = 'green'
    ctx.fillRect(0,0,innerWidth,x)
    x++
    if (x > innerHeight) x = 0
}

var canvas
var ctx

var bodyLoaded = () => {
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    canvas.width = innerWidth
    canvas.height = innerHeight
    setInterval(function(){draw()}, 12)
}

window.onresize = function() {
    canvas.width = innerWidth
    canvas.height = innerHeight
}