var canvas
var ctx
var player
var enemies = []
var pellets = []
var drawInterval
var pelletSpeed = 5
var keys = {
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    space: 0
}

class Player {
    constructor() {
        this.x = 0
        this.y = 0
        this.facing = 0 // -PI to PI in radians
        this.vx = 0
        this.vy = 0
        this.ax = 0
        this.ay = 0
        this.lives = 3
        this.shotTimer = 0
    }
    tick() {
        // PHYSICS
        this.vx += this.ax
        this.ax = 0
        this.vy += this.ay
        this.ay = 0
        this.x += this.vx
        this.vx *= .93 // .93 can be thought of as inertia
        this.y += this.vy
        this.vy *= .93

        this.shotTimer++
        // COLLISIONS
        if (this.x < -innerWidth) {
            this.ax += 2
        } else if (this.x > innerWidth) {
            this.ax -= 2
        }
        if (this.y < -innerHeight) {
            this.ay += 2
        } else if (this.y > innerHeight) {
            this.ay -= 2
        }
        // TODO : Object Collisions
        // Not sure if I should put object collisions in pellet ticking or in player/enemy ticking

        // RENDER
        ctx.strokeStyle = "#D02525"
        ctx.lineWidth = 2
        ctx.translate(innerWidth / 2, innerHeight / 2)
        ctx.rotate(this.facing)
        ctx.strokeRect(-10, -10, 20, 20)
        ctx.resetTransform()
    }
    input(action) {
        if (action == 'moveUp') {
            console.log("Moving Up")
            this.ay -= 1
        } else if (action == 'moveDown') {
            console.log("Moving Down")
            this.ay += 1
        } else if (action == 'moveLeft') {
            console.log("Moving Left")
            this.ax -= 1
        } else if (action == 'moveRight') {
            console.log("Moving Right")
            this.ax += 1
        } else if (action == 'shoot') {
            console.log("Shooting")
            if (this.shotTimer > 12) {
                pellets.push(new Pellet(this.x, this.y, Math.cos(this.facing) * pelletSpeed * (Math.random() + 1), Math.sin(this.facing) * pelletSpeed * (Math.random() + 1), 'player'))
                this.shotTimer = 0
            }
        } else console.log("Invalid Action")
    }
    turn(x, y) {
        this.facing = Math.atan2(y - innerHeight / 2, x - innerWidth / 2)
    }
}

class Pellet {
    constructor(x, y, vx, vy, team) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.team = team
        this.lifetime = 0
        this.hitDetected = false
    }
    tick() {
        this.x += this.vx
        this.y += this.vy
        this.lifetime++
        ctx.translate(-player.x + (innerWidth / 2) + this.x, -player.y + (innerHeight / 2) + this.y)
        ctx.rotate(Math.atan2(this.vy,this.vx))
        ctx.strokeRect(0,0,6,1)
        ctx.resetTransform()
    }
}

class Enemy {
    constructor() {
        this.x = (Math.random() - .5) * innerWidth
        this.y = (Math.random() - .5) * innerHeight
        this.vx = (Math.random() * 2) - 1
        this.vy = (Math.random() * 2) - 1
        this.shotTimer = 50
        this.hitDetected = false
        this.facing = (Math.random() - .5) * Math.PI
    }
    tick() {
        // PHYSICS
        this.x += this.vx
        this.y += this.vy

        this.shotTimer++

        // Automatic attack player
        if (this.shotTimer > 15) {
            if (Math.random() < 5)
            pellets.push(new Pellet(this.x, this.y, Math.cos(Math.atan2(player.y - this.y, player.x - this.x)) * pelletSpeed * (Math.random()/5 + 1), Math.sin(Math.atan2(player.y - this.y, player.x - this.x)) * pelletSpeed * (Math.random()/5 + 1), 'enemy'))
            this.shotTimer = 0
        }

        // RENDER
        ctx.translate(-player.x + (innerWidth / 2) + this.x, -player.y + (innerHeight / 2) + this.y)
        ctx.rotate(this.facing)
        ctx.strokeRect(-10,-10,20,20)
        ctx.resetTransform()
    }
}

var newGame = () => {
    player = new Player()
    drawInterval = setInterval(function(){draw()}, 12)
}

var draw = () => {
    // Environment
    ctx.fillStyle = '#555555' 
    ctx.fillRect(0, 0, innerWidth, innerHeight)
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 10
    ctx.translate(-player.x + (innerWidth / 2), -player.y + (innerHeight / 2))
    ctx.strokeRect(-innerWidth, -innerHeight, innerWidth * 2, innerHeight * 2)
    ctx.resetTransform()
    // Objects
    player.tick()
    ctx.strokeStyle = '#f2f200'
    ctx.strokeWidth = 1
    for (i = 0; i < pellets.length; i++) {
        if (pellets[i].lifetime > 250 || pellets[i].hitDetected) {
            pellets.splice(i, 1)
        } else {
            pellets[i].tick()
        }
    }
    ctx.strokeStyle = '#bd8017'
    ctx.strokeWidth = 2
    for (i = 0; i < enemies.length; i++) {
        if (enemies[i].hitDetected) {
            enemies.splice(i, 1)
        } else {
            enemies[i].tick()
        }
    }
}

var bodyLoaded = function() {
    document.addEventListener('keydown', (evt) => {
        if (!evt.repeat) {
            switch(evt.code) {
                case 'ArrowUp':
                    clearInterval(keys.up)
                    keys.up = setInterval(function () {
                        player.input('moveUp')
                    }, 20)
                    break;
                case 'ArrowDown':
                    clearInterval(keys.down)
                    keys.down = setInterval(function () {
                        player.input('moveDown')
                    }, 20)
                    break;
                case 'ArrowLeft':
                    clearInterval(keys.left)
                    keys.left = setInterval(function () {
                        player.input('moveLeft')
                    }, 20)
                    break;
                case 'ArrowRight':
                    clearInterval(keys.right)
                    keys.right = setInterval(function () {
                        player.input('moveRight')
                    }, 20)
                    break;
                case 'ControlRight':
                    clearInterval(keys.space)
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
            case 'ControlRight':
                clearInterval(keys.space)
                break;
        }
    })
    document.addEventListener('mousemove', (evt) => {
        player.turn(evt.x,evt.y)
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