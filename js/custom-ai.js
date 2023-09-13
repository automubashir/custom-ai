"use strict";

class CustomBot {
    constructor(container, color = "black", start = "true", speed = 200) {
        this.bot = container
        this.color = color
        this.speed = speed || 500
        if (color) this.bot.classList.add('bg-' + color)
        this.eyes = new Eyes(this.bot)
        this.position = {
            left: this.bot.getBoundingClientRect().x + this.bot.clientWidth/2,
            right: window.innerWidth - this.bot.getBoundingClientRect().x + this.bot.clientWidth,
            top: this.bot.getBoundingClientRect().y + this.bot.clientHeight/2,
            bottom: this.bot.getBoundingClientRect().y + this.bot.clientHeight,
        }
        this.route = []
        this.traveled = {
            x: this.position.left,
            y: this.position.top,
            center: {
                x: this.position.left + this.bot.clientWidth/2,
                y: this.position.top + this.bot.clientHeight/2
            }
        }
        setTimeout(() => {
            this.start()
        }, 2000);
    }

    start() {
        window.addEventListener('resize',x=>{

        })
        setInterval(x => {
            // this.eyes.getPosition();
            this.onRoute();
        }, this.speed)
    }

    onRoute() {
        let danger_zone = this.eyes.danger_zone;
        // if(danger_zone.angle<this.eyes.direction.angle+5 && danger_zone.angle > this.eyes.direction.angle-5) {
        //     this.eyes.setDirection({
        //         x: 0.3,
        //         y: 1,
        //         angle: this.eyes.direction.angle+5
        //     })
        // }

        this.traveled = {
            x: this.traveled.x + this.eyes.direction.x,
            y: this.traveled.y + this.eyes.direction.y,
            center: {
                x: this.traveled.x + this.eyes.direction.x - this.bot.clientWidth/2,
                y: this.traveled.y + this.eyes.direction.y - this.bot.clientHeight/2
            }
        }
        
        this.bot.setAttribute('style', `
            left: ${this.traveled.center.x}px;
            top: ${this.traveled.center.y}px`)
        
        console.log(this.eyes.direction)
    }

    getPosition() {
        this.position = {
            left: this.bot.getBoundingClientRect().x,
            right: this.bot.getBoundingClientRect().x + this.bot.clientWidth,
            top: this.bot.getBoundingClientRect().y,
            bottom: this.bot.getBoundingClientRect().y + this.bot.clientHeight,
            center: {
                x: this.bot.getBoundingClientRect().x + (this.bot.clientWidth / 2),
                y: this.bot.getBoundingClientRect().y + (this.bot.clientHeight / 2)
            }
        }
    }
}

class Eyes {
    constructor(bot) {
        this.bot = bot;
        this.range = 300
        this.wide_angle = 135
        this.danger_zone = {
            x: 0,
            y: 0,
            angle: 0
        }
        this.position = {
            left: this.bot.getBoundingClientRect().x,
            right: this.bot.getBoundingClientRect().x + this.bot.clientWidth,
            top: this.bot.getBoundingClientRect().y,
            bottom: this.bot.getBoundingClientRect().y + this.bot.clientHeight,
            center: {
                x: this.bot.getBoundingClientRect().x + (this.bot.clientWidth / 2),
                y: this.bot.getBoundingClientRect().y + (this.bot.clientHeight / 2)
            }
        }
        let angle = 320
        this.obstacles = []
        let point_directional = this.calculatePointInDirection(this.position.left,this.position.bottom,angle,100)
        let directional_ = this.calculatePointInDirection(this.position.left,this.position.bottom,angle,100)
        let ratio = this.stepsRatio({x: this.position.left,y:this.position.top},directional_)
        this.addDirectionPoint(point_directional)
        this.direction = {
            x: ratio.x,
            y: ratio.y,
            angle: angle,
        }
        this.start();
    }

    setDirection(direction) {
        this.direction = direction;
    }

    start() {
        setInterval(x => {
            // this.watch()
        }, 200)
    }

    calculateAngle(x, y) {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        if (angle < 0) {
            angle += 360;
        }
        return parseFloat(angle.toFixed(2));
    }

    calculateSides(angleA, lengthAB) {
        // Given angle measures in degrees
        const angleB = (180 - angleA) / 2;
        const angleC = angleB;

        // Convert angles to radians for trigonometric functions
        const angleARad = (angleA * Math.PI) / 180;
        const angleBRad = (angleB * Math.PI) / 180;
        const angleCRad = (angleC * Math.PI) / 180;

        // Calculate lengths of sides AC and BC using law of sines
        const lengthAC = (lengthAB * Math.sin(angleCRad)) / Math.sin(angleBRad);
        const lengthBC = (lengthAB * Math.sin(angleARad)) / Math.sin(angleBRad);

        return {
            ab: parseFloat(lengthAB.toFixed(2)),
            bc: parseFloat(lengthBC.toFixed(2)),
            ac: parseFloat(lengthAC.toFixed(2))
        }
    }

    watch() {
        // this.direction.angle = this.calculateAngle(this.direction.x, this.direction.y); // x, y
        // console.log(this.direction)
        let obstacles = document.body.querySelectorAll('*')

        obstacles.forEach(x => {
            let obstacle = {
                node: x,
                position: {
                    left: x.getBoundingClientRect().x,
                    right: x.getBoundingClientRect().x + x.clientWidth,
                    top: x.getBoundingClientRect().y,
                    bottom: x.getBoundingClientRect().y + x.clientHeight,
                    center: {
                        x: x.getBoundingClientRect().x + (x.clientWidth / 2),
                        y: x.getBoundingClientRect().y + (x.clientHeight / 2)
                    },
                },
                direction: {
                    x: 0,
                    y: 0,
                    angle: 0,
                }
            }

            if (x.nodeName !== 'CUSTOM-BOT' && x.nodeName != 'POINT' && (x.clientHeight != 0 && x.clientWidth != 0)) {
                let distance = this.calculateDistance(obstacle.position.center.x, obstacle.position.center.y,
                    this.position.center.x, this.position.center.y)
                let ang = this.calculateAngle(obstacle.position.center.x - this.position.center.x, (this.position.center.y - obstacle.position.center.y))
                let sides = this.calculateSides(Math.abs(ang - this.direction.angle), distance)
                obstacle.direction.angle = this.calculateAngle(obstacle.direction.x, obstacle.direction.y)
                let side_offset = (x.clientHeight > x.clientWidth ? x.clientHeight : x.clientWidth) / Math.sqrt(2);
                let directionAxis = this.getSideAxis(this.position.center.x, (window.innerHeight / 2) - this.position.center.y, sides.ac, this.direction.angle);
                if (sides.bc <= this.bot.clientHeight + side_offset) {
                    directionAxis["angle"] = ang
                    directionAxis["obstacle"] = obstacle
                    this.danger_zone = directionAxis
                    let new_angle = this.direction.angle-5
                    let point_directional = this.calculatePointInDirection(this.position.center.x,this.position.center.y,new_angle,100)
                    let ratio = this.stepsRatio(this.position.center,point_directional)
                    this.direction = {
                        angle: new_angle,
                        x: ratio.x,
                        y: ratio.y,
                    }
                }
                this.addObstacle(obstacle)
                if (!document.querySelector('point')) {
                    document.body.insertAdjacentHTML('beforeend', `<point class="${(sides.bc <= this.bot.clientHeight + side_offset) ? 'danger-zone' : ''}" style="left:${directionAxis.x}px; top: ${(window.innerHeight / 2) - directionAxis.y}px;"></point>`)
                }
                console.log(sides, "obstacle angle: " + ang, 'bot angle: ' + this.direction.angle, "point bc: ", directionAxis, this.danger_zone)
            }
        })
    }

    stepsRatio(pointa,pointb) {
        let difX = pointb.x - pointa.x
        let difY = pointb.y - pointa.y

        let json = {
            x: !difY?difX:difX/difY,
            y: !difX?difY:difY/difX
        }

        json.x = (pointb.x<pointa.x)?json.x:Math.abs(json.x)
        json.y = (pointb.y<pointa.y)?json.y:Math.abs(json.y)

        let denominator = json.x<json.y?json.y:json.x

        json.x = json.x/denominator
        json.y = json.y/denominator

        return json;
    }

    addDirectionPoint(point) {
        if (!document.querySelector('point')) {
            document.body.insertAdjacentHTML('beforeend', `<point class="" style="left:${point.x}px; top: ${point.y}px;"></point>`)
        }
    }

    getPosition() {
        this.position = {
            left: this.bot.getBoundingClientRect().x,
            right: this.bot.getBoundingClientRect().x + this.bot.clientWidth,
            top: this.bot.getBoundingClientRect().y,
            bottom: this.bot.getBoundingClientRect().y + this.bot.clientHeight,
            center: {
                x: this.bot.getBoundingClientRect().x + (this.bot.clientWidth / 2),
                y: this.bot.getBoundingClientRect().y + (this.bot.clientHeight / 2)
            }
        }
    }

    addObstacle(obstacle) {
        let obs = this.obstacles.find(x => x.node == obstacle.node)
        if (obs) {
            this.obstacles[this.obstacles.indexOf(obs)] = obstacle;
        } else {
            this.obstacles.push(obstacle)
        }
    }

    getSideAxis(x_A, y_A, length, angle_degrees) {
        var angle_radians = angle_degrees * (Math.PI / 180);
        var x_B = x_A + length * Math.cos(angle_radians);
        var y_B = y_A + length * Math.sin(angle_radians);
        return { x: x_B, y: y_B };
    }

    calculateDistance(x1, y1, x2, y2) {
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        return distance;
    }

    calculatePointInDirection(xA, yA, angleDegrees, range) {
        let fixed = {
            "0": {
                x: xA+range,
                y: yA
            },
            "360": {
                x: xA+range,
                y: yA
            },
            "90": {
                x: xA,
                y: yA-range
            },
            "180": {
                x: xA-range,
                y: yA
            },
            "270": {
                x: xA,
                y: yA+range
            },
        }
        if(angleDegrees==0 || angleDegrees==90 || angleDegrees==180 || angleDegrees==270 || angleDegrees==360) {
            return fixed[angleDegrees+""]
        }
        // Convert angle from degrees to radians
        const angleRadians = (angleDegrees * Math.PI) / 180;

        // Calculate the new X and Y coordinates
        var xB = xA + (range * Math.cos(angleRadians));
        var yB = yA + (range * Math.sin(angleRadians));

        if(xB<0) {
            xB = xA + Math.abs(xB)
        }
        if(yB<0) {
            yB = yA + Math.abs(yB)
        }

        return { x: xB, y: yB };
    }
}

// getting custom-bots from html
window.onload = function () {
    let bots = document.querySelectorAll("custom-bot")
    let doc = document.querySelector('head')

    let styles = `
        custom-bot {
            display: block;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background-color: black;
            position: fixed;
            left: 50%;
        }
        .bg-black {
            background-color: black;
        }
        .bg-white {
            background-color: white;
        }
        .bg-blue {
            background-color: blue;
        }
        .bg-green {
            background-color: green;
        }
        .bg-red {
            background-color: red;
        }
        point {
            position: fixed;
            display: block;
            background: blue;
            width: 2px;
            height: 2px;
        }
    `
    doc.insertAdjacentHTML('beforeend', `<style>${styles}</style>`)

    bots.forEach((x, i) => {
        x.setAttribute('data-id', 'custom-bot-' + (i + 1))
        x.style.top = x.clientHeight * (i + 1) + 'px'
        new CustomBot(x, x.getAttribute('color'), x.getAttribute('start'), x.getAttribute('speed'));
    })
}