var canvas
var ctx
var player
var goal
var shop
var upgrades
var gold = []
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

var upgradeInfo = {
    pellets:{
        pos:0,
        cost:[5,10,15,20],
        amplifiers:[1,2,3,4,5],
        text:"Pellet Count [1]"
    },
    spread:{
        pos:1,
        cost:[5,10,15,20],
        amplifiers:[1,2,4,8,200],
        text:"Pellet Spread [2]"
    },
    speed:{
        pos:2,
        cost:[5,10,15,20],
        amplifiers:[3,5,7,9,13],
        cooldowns:[15,12,10,8,5],
        text:"Pellet Speed [3]"
    },
    evasive:{
        pos:3,
        cost:[5,10,15,20],
        amplifiers:[1,.9,.8,.65,.5],
        text:"Evasiveness [4]"
    },
    magnet:{
        pos:4,
        cost:[3,5,7,10],
        amplifiers:[1,1.5,2,3,5],
        text:"Coin Magnet [5]"
    }
}

class Upgrades {
    constructor() {
        this.pellets = 0
        this.spread = 0
        this.speed = 0
        this.evasive = 0
        this.magnet = 0
        this.gold = 10
    }
    shop() {
        player.shopOpen = true
        ctx.fillStyle = '#555555' 
        ctx.fillRect(0, 0, innerWidth, innerHeight)

        ctx.strokeStyle = '#252525'
        ctx.lineWidth = 2
        for (i in upgradeInfo) {
            ctx.fillStyle = '#228822'
            ctx.fillRect(280,25 + (upgradeInfo[i].pos * 60), (upgrades[i] + 1) * 100, 50)
            ctx.font = '48px sans-serif'
            ctx.fillStyle = '#252525'
            ctx.fillText(upgradeInfo[i].text, 20, 69 + (upgradeInfo[i].pos * 60), 180)
            if (upgradeInfo[i].cost[upgrades[i]]) ctx.fillText(upgradeInfo[i].cost[upgrades[i]].toString(), 220, 69 + (upgradeInfo[i].pos * 60), 60)
            for (var j = 0; j < 5; j++) {
                ctx.strokeRect(280 + (j * 100), 25 + (upgradeInfo[i].pos * 60), 100, 50)
            }
        }
        ctx.font = '48px sans-serif'
        ctx.fillStyle = '#252525'
        ctx.fillText("Funds: " + upgrades.gold, 20, 369, 180)
        ctx.fillText("Done [Enter]", 220, 369)
    }
    buy(type) {
        if (upgrades[type] < 4) {
            if (upgrades.gold >= upgradeInfo[type].cost[upgrades[type]] && player.shopOpen == true) {
                upgrades.gold -= upgradeInfo[type].cost[upgrades[type]]
                upgrades[type]++
                upgrades.shop()
            }
        }
    }
    closeShop() {
        if (player.shopOpen) newGame()
    }
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
        this.shopOpen = false
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
            this.ay -= 1 / upgradeInfo.evasive.amplifiers[upgrades.evasive]
        } else if (action == 'moveDown') {
            console.log("Moving Down")
            this.ay += 1 / upgradeInfo.evasive.amplifiers[upgrades.evasive]
        } else if (action == 'moveLeft') {
            console.log("Moving Left")
            this.ax -= 1 / upgradeInfo.evasive.amplifiers[upgrades.evasive]
        } else if (action == 'moveRight') {
            console.log("Moving Right")
            this.ax += 1 / upgradeInfo.evasive.amplifiers[upgrades.evasive]
        } else if (action == 'shoot') {
            console.log("Shooting")
            if (this.shotTimer > upgradeInfo.speed.cooldowns[upgrades.speed]) {
                // This switch describes how pellets should be spawned depending on the upgrade for pellet count
                switch(upgradeInfo.pellets.amplifiers[upgrades.pellets]) {
                    case 5:
                        pellets.push(new Pellet(
                            this.x, 
                            this.y, 
                            Math.cos(this.facing - .628 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            Math.sin(this.facing - .628 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            'player'
                            ))
                    case 4:
                        pellets.push(new Pellet(
                            this.x, 
                            this.y, 
                            Math.cos(this.facing + .628 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            Math.sin(this.facing + .628 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            'player'
                            ))
                    case 3:
                        pellets.push(new Pellet(
                            this.x, 
                            this.y, 
                            Math.cos(this.facing - .314 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            Math.sin(this.facing - .314 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            'player'
                            ))
                    case 2:
                        pellets.push(new Pellet(
                            this.x, 
                            this.y, 
                            Math.cos(this.facing + .314 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            Math.sin(this.facing + .314 + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            'player'
                            ))
                    case 1:
                        pellets.push(new Pellet(
                            this.x, 
                            this.y, 
                            Math.cos(this.facing + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            Math.sin(this.facing + (Math.random() - .5) / upgradeInfo.spread.amplifiers[upgrades.spread] ) * upgradeInfo.speed.amplifiers[upgrades.speed] * (Math.random() / 10 + 1), 
                            'player'
                            ))
                        break;
                }
                this.shotTimer = 0
            }
        } else console.log("Invalid Action")
    }
    turn(x, y) {
        this.facing = Math.atan2(y - innerHeight / 2, x - innerWidth / 2)
    }
    hit() {
        if (this.invulnerability > 75 && Math.random() < upgradeInfo.evasive.amplifiers[upgrades.evasive]) {
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
                    for (var j = 0; j < 3; j++) {
                        gold.push(new Gold(this.x + (Math.random() - .5) * 25, this.y + (Math.random() - .5) * 25))
                    }
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
        // Render
        ctx.strokeStyle = "#22DDDD"
        ctx.lineWidth = 2
        if (debugging) ctx.translate(this.x + innerWidth / 2, this.y + innerHeight / 2)
        else ctx.translate(-player.x + (innerWidth / 2) + this.x, -player.y + (innerHeight / 2) + this.y)
        ctx.beginPath()
        ctx.arc(0, 0, 20, 0, Math.PI * 2)
        ctx.stroke()

        ctx.globalAlpha = enemies.length / (round + 1)
        ctx.fillStyle = "#22DDDD"
        ctx.beginPath()
        ctx.arc(0, 0, 20, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.resetTransform()

        // Check Collision with Player
        if (Math.sqrt(((this.x - player.x) * (this.x - player.x)) + ((this.y - player.y) * (this.y - player.y))) < 20 && enemies.length == 0) {
            round++
            clearInterval(drawInterval)
            upgrades.shop()
        }
    }
}

class Gold {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.hitDetected = false
    }
    tick() {
        // Render
        if (debugging) ctx.translate(this.x + innerWidth / 2, this.y + innerHeight / 2)
        else ctx.translate(-player.x + (innerWidth / 2) + this.x, -player.y + (innerHeight / 2) + this.y)
        ctx.beginPath()
        ctx.arc(0, 0, 3, 0, Math.PI * 2)
        ctx.stroke()
        ctx.resetTransform()

        // Check if collected by player
        if (Math.sqrt(((this.x - player.x) * (this.x - player.x)) + ((this.y - player.y) * (this.y - player.y))) < 15 * upgradeInfo.magnet.amplifiers[upgrades.magnet]) {
            this.hitDetected = true
            upgrades.gold += 3
        }
    }
}
var newGame = () => {
    player = new Player()
    goal = new Goal()
    pellets = []
    enemies = []
    gold = []
    for (i = 0; i < round; i++) {
        enemies.push(new Enemy())
    }
    drawInterval = setInterval(function(){draw()}, 12)
}

var gameOver = () => {
    clearInterval(drawInterval)
    setInterval(function() {
        ctx.font = '50px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgb(' + (Math.random() + 0.775)*100 + ', 0, 0)'
        ctx.fillText("Game Over", innerWidth / 2, innerHeight / 2)
    },50)
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
    ctx.strokeStyle = '#55aa55'
    ctx.strokeWidth = 1
    for (i = 0; i < gold.length; i++) {
        if (gold[i].lifetime > 250 || gold[i].hitDetected) {
            gold.splice(i, 1)
        } else {
            gold[i].tick()
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
                    }, 2)
                    break;
                case 'KeyD':
                    toggleDebug()
                    break;
                case 'Digit1':
                    upgrades.buy('pellets')
                    break;
                case 'Digit2':
                    upgrades.buy('spread')
                    break;
                case 'Digit3':
                    upgrades.buy('speed')
                    break;
                case 'Digit4':
                    upgrades.buy('evasive')
                    break;
                case 'Digit5':
                    upgrades.buy('magnet')
                    break;
                case 'Enter':
                    upgrades.closeShop()
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
    upgrades = new Upgrades()
    canvas.width = innerWidth
    canvas.height = innerHeight
    newGame()
}

window.onresize = function() {
    canvas.width = innerWidth
    canvas.height = innerHeight
    if (!player.shopOpen) draw()
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