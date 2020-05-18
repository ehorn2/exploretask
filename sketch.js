var canvas
var ctx
var player
var goal
var enemies = []
var pellets = []
var drawInterval = 0
var pelletSpeed = 5
var round = 1
var debugging = false
var width = 800
var height = 400
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
        this.invulnerability = 50
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
        this.invulnerability++
        // COLLISIONS
        if (this.x < -width) {
            this.ax += 2
        } else if (this.x > width) {
            this.ax -= 2
        }
        if (this.y < -height) {
            this.ay += 2
        } else if (this.y > height) {
            this.ay -= 2
        }
        // TODO : Object Collisions
        // Not sure if I should put object collisions in pellet ticking or in player/enemy ticking

        // RENDER
        switch(this.lives) {
            case 3:
                ctx.strokeStyle = "#22DD22"
                break;
            case 2:
                ctx.strokeStyle = "#EEEE22"
                break;
            case 1:
            default:
                ctx.strokeStyle = "#DD2222"
                break;
        }
        ctx.lineWidth = 2
        if (debugging) ctx.translate(this.x + innerWidth / 2, this.y + innerHeight / 2)
            else ctx.translate(innerWidth / 2, innerHeight / 2)
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
    hit() {
        if (this.invulnerability > 125) {
            this.lives--
            this.invulnerability = 0
            if (this.lives == 0) gameOver()
        }
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

        if (debugging) ctx.translate(this.x + innerWidth / 2, this.y + innerHeight / 2)
        else ctx.translate(-player.x + (innerWidth / 2) + this.x, -player.y + (innerHeight / 2) + this.y)
        ctx.rotate(Math.atan2(this.vy,this.vx))
        ctx.strokeRect(0,0,-3,1)
        ctx.resetTransform()

        // Map Boundaries
        if (this.x < -width || this.x > width) {
            this.hitDetected = true
        } else if (this.y < -height || this.y > height) {
            this.hitDetected = true
        }
        if (this.x < player.x + 10 && this.x > player.x - 10 && this.y < player.y + 10 && this.y > player.y - 10 && this.team == "enemy") {
            player.hit()
            this.hitDetected = true
            console.log("Player hit!")
        }
        enemies.forEach(i => {
            if (this.x < i.x + (3*i.lives) && this.x > i.x - (3*i.lives) && this.y < i.y + (3*i.lives) && this.y > i.y - (3*i.lives) && this.team == "player" && i.invulnerability > 125) {
                console.log("Enemy hit!")
                this.hitDetected = true
                i.lives--
                if (i.lives == 0) {
                    i.hitDetected = true
                }
            }
        })
    }
}

class Enemy {
    constructor() {
        this.x = (Math.random() - .5) * width
        this.y = (Math.random() - .5) * height
        this.vx = (Math.random() * 2) - 1
        this.vy = (Math.random() * 2) - 1
        this.shotTimer = 50
        this.hitDetected = false
        this.facing = (Math.random() - 0.5) * Math.PI
        this.lives = 3
        this.invulnerability = 50
    }
    tick() {
        // PHYSICS
        this.x += this.vx
        this.y += this.vy
 
        this.shotTimer++
        this.invulnerability++

        // Map Boundaries
        if (this.x < -width) this.vx = Math.abs(this.vx)
        if (this.x > width) this.vx = Math.abs(this.vx) * -1
        if (this.y < -height) this.vy = Math.abs(this.vy)
        if (this.y > height) this.vy = Math.abs(this.vy) * -1

        // Automatic attack player
        if (this.shotTimer > 25) {
            if (Math.random() < .1)
            pellets.push(new Pellet(this.x, this.y, Math.cos(Math.atan2(player.y - this.y, player.x - this.x)) * pelletSpeed * (Math.random()/5 + 1), Math.sin(Math.atan2(player.y - this.y, player.x - this.x)) * pelletSpeed * (Math.random()/5 + 1), 'enemy'))
            this.shotTimer = 0
        }

        // RENDER
        if (debugging) ctx.translate(this.x + innerWidth / 2, this.y + innerHeight / 2)
        else ctx.translate(-player.x + (innerWidth / 2) + this.x, -player.y + (innerHeight / 2) + this.y)
        ctx.rotate(this.facing)
        ctx.strokeRect(-3 * this.lives, -3 * this.lives, 6 * this.lives, 6 * this.lives)
        ctx.resetTransform()
        this.facing += .01
    }
}

class Goal {
    constructor() {
        this.x = (Math.random() - .5) * 2 * width
        this.y = (Math.random() - .5) * 2 * height
    }
    tick() {
        // Check Collision with Player
        if (Math.sqrt(((this.x - player.x) * (this.x - player.x)) + ((this.y - player.y) * (this.y - player.y))) < 20) {
            round++
            newGame()
        }
        // Render
        ctx.strokeStyle = "#22DDDD"
        ctx.lineWidth = 2
        if (debugging) ctx.translate(this.x + innerWidth / 2, this.y + innerHeight / 2)
        else ctx.translate(-player.x + (innerWidth / 2) + this.x, -player.y + (innerHeight / 2) + this.y)
        ctx.beginPath()
        ctx.arc(0, 0, 20, 0, Math.PI * 2)
        ctx.stroke()
        ctx.resetTransform()
    }
}

var newGame = () => {
    player = new Player()
    goal = new Goal()
    pellets = []
    enemies = []
    for (i = 0; i < round; i++) {
        enemies.push(new Enemy())
    }
    clearInterval(drawInterval)
    drawInterval = setInterval(function(){draw()}, 12)
}

var gameOver = () => {
    // TODO: Game over screen!
    //      -- Score??
    clearInterval(drawInterval)
}

var draw = () => {
    // Environment
    ctx.fillStyle = '#555555' 
    ctx.fillRect(0, 0, innerWidth, innerHeight)
    if (!debugging) {
        ctx.strokeStyle = '#111111'
        ctx.lineWidth = 10
        ctx.translate(-player.x + (innerWidth / 2), -player.y + (innerHeight / 2))
        ctx.strokeRect(-innerWidth, -innerHeight, innerWidth * 2, innerHeight * 2)
        ctx.resetTransform()
    }
    // Objects
    player.tick()
    goal.tick()
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
                case 'KeyD':
                    toggleDebug()
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


// For debugging purposes: removes the "camera"
var toggleDebug = () => {
    if (debugging) {
        debugging = false
        remote.windowSize(width,height)
    } else {
        debugging = true
        remote.windowSize(width*2, height*2)
    }
}