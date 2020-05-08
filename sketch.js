var setup = () => {
    createCanvas(800,800)
    background(0,0,0)
}
var x = 0
var draw = () => {
    fill(100,100,100)
    rect(0,0,800,x)
    x++
}