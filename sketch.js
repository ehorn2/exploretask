var canvas
var ctx
var player
var enemies = []
var pellets = []
var drawInterval
var keys = {
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    space: 0
}

var Player = function() {
    this.x = 0
    this.y = 0
    this.facing = 0 // 0 - 2 PI radians????
    this.vx = 0
    this.vy = 0
    this.ax = 0
    this.ay = 0
    this.lives = 3
    this.tick = function() {
        // PHYSICS
        this.vx += this.ax
        this.ax = 0
        this.vy += this.ay
        this.ay = 0
        this.x += this.vx
        this.vx *= .9
        this.y += this.vy
        this.vy *= .9

        // COLLISIONS : TODO

        // RENDER
        ctx.strokeStyle = "#D02525"
        ctx.translate(innerWidth/2,innerHeight/2)
        ctx.rotate(this.facing)
        ctx.strokeRect(-10,-10,20,20)
        ctx.resetTransform()
    }
    this.input = function(action) {
        if (action == 'moveForward') {
            console.log("Moving Forward")
            this.ay += 1
        } else if (action == 'moveBack') {
            console.log("Moving Backwards")
            this.ay -= 1
        } else if (action == 'turnLeft') {
            console.log("Turning Left")
            this.facing -= .05
        } else if (action == 'turnRight') {
            console.log("Turning Right")
            this.facing += .05
        } else if (action == 'shoot') {
            console.log("Shooting")
        } else console.log("Invalid Action")
    }
}

var Pellet = function(x, y, vx, vy, team, damage) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.team = team
    this.damage = damage
}

var Enemy = function() {
    this.x = Math.random() * innerWidth * 2
    this.y = Math.random() * innerHeight * 2
    this.vx = (Math.random() * 2) - 1
    this.vy = (Math.random() * 2) - 1
    this.shotTimer = 50
    this.tick = function() {
        this.x += this.vx
        this.y += this.vy
        if (this.shotTimer == 0) {
            if (Math.random() < .05) this.shoot()
        } else this.shotTimer--
    }
    this.shoot = function() {
        this.shotTimer = 500
    }
}

var newGame = () => {
    player = new Player()
    drawInterval = setInterval(function(){draw()}, 12)
}

var draw = () => {
    ctx.fillStyle = 'gray'
    ctx.fillRect(0,0,innerWidth,innerHeight)
    player.tick()
}

var bodyLoaded = function() {
    document.addEventListener('keydown', (evt) => {
        if (!evt.repeat) {
            switch(evt.code) {
                case 'ArrowUp':
                    keys.up = setInterval(function () {
                        player.input('moveForward')
                    }, 20)
                    break;
                case 'ArrowDown':
                    keys.down = setInterval(function () {
                        player.input('moveBack')
                    }, 20)
                    break;
                case 'ArrowLeft':
                    keys.left = setInterval(function () {
                        player.input('turnLeft')
                    }, 20)
                    break;
                case 'ArrowRight':
                    keys.right = setInterval(function () {
                        player.input('turnRight')
                    }, 20)
                    break;
                case 'Space':
                    keys.space = setInterval(function () {
                        player.input('shoot')
                    }, 20)
                    break;
            }
        }
    })
    document.addEventListener('keyup', (evt) => {
        switch(evt.code) {
            case 'ArrowUp':
                clearInterval(keys.up)
                break;
            case 'ArrowDown':
                clearInterval(keys.down)
                break;
            case 'ArrowLeft':
                clearInterval(keys.left)
                break;
            case 'ArrowRight':
                clearInterval(keys.right)
                break;
            case 'Space':
                clearInterval(keys.space)
                break;
        }
    }) 
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    canvas.width = innerWidth
    canvas.height = innerHeight
    newGame()
}

window.onresize = function() {
    canvas.width = innerWidth
    canvas.height = innerHeight
    draw()
}