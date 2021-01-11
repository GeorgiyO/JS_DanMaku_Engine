import {Util} from "../../Util.js";

export {Bullet, Mob, Player};

class GameObject {
    width;
    height;
    x;
    y;
    isAlive = true;

    setWidth = (width) => {this.width = width; return this;}
    setHeight = (height) => {this.height = height; return this;}
    setX = (x) => {this.x = x; return this;}
    setY = (y) => {this.y = y; return this;}
    setAlive = (alive) => {this.isAlive = alive; return this;}

    setLeft = (a) => {this.x = a; return this;}
    setRight = (a) => {this.x = a - this.width; return this;}
    setTop = (a) => {this.y = a; return this;}
    setBottom = (a) => {this.y = a - this.height; return this;}
    setCenter = (xy) => {
        this.x = xy.x - this.width / 2;
        this.y = xy.y - this.height / 2;
        return this;
    }

    get left() {return this.x}
    get right() {return this.x + this.width}
    get top() {return this.y}
    get bottom() {return this.y + this.height}
    get center() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        }
    }
}

class MovingObject extends GameObject {

    static isOutOfBounds;
    /**
     * @param defaultShouldDieCondition f(Bullet.class obj) => boolean
     */
    static setIsOutOfBounds = (defaultShouldDieCondition) => {
        MovingObject.isOutOfBounds = defaultShouldDieCondition;
    }

    movingFunction;

    angle;

    setAngle = (angle) => {this.angle = angle; return this;}

    /**
     * @param movingFunction = f() => {dr}
     */
    setMovingFunction = (movingFunction) => {this.movingFunction = movingFunction; return this};

    update() {
        let dr = this.movingFunction();
        let dxy = Util.polarToRect(dr, this.angle);

        this.x += dxy.x;
        this.y += dxy.y;

        if (MovingObject.isOutOfBounds(this)) {
            this.isAlive = false;
        }
    }
}

class Bullet extends MovingObject {

    static getBulletArray;
    /**
     * @param bulletsArray = f() => [Bullet]
     */
    static setBulletsArray = (bulletsArray) => {Bullet.getBulletArray = bulletsArray}

    static baseTestBullet = () => {
        return new Bullet()
            .setColor("#b00")
            .setWidth(16)
            .setHeight(16);
    }

    color;

    setColor = (color) => {this.color = color; return this}

    append = () => {
        Bullet.getBulletArray().push(this);
    }
}

class Mob extends MovingObject {

    static getMobsArray;
    /**
     * @param mobsArray = f() => [mobsArray]
     */
    static setMobsArray = (mobsArray) => {Mob.getMobsArray = mobsArray}

    color = "#880";

    hitPoints;

    attackTypes = [];
    attackOrder;

    // should remove all setIntervals / setTimeouts when mob die
    onDie = [];

    setHP = (hp) => {this.hitPoints = hp; return this;}
    /**
     * @param attackTypes = [f() => void, should shoot bullets]
     */
    setAttackTypes = (attackTypes) => {this.attackTypes = attackTypes; return this;}
    /**
     * @param attackOrder = f() => void, determines how attacks will be executed
     */
    setAttackOrder = (attackOrder) => {this.attackOrder = attackOrder; return this;}
    setOnDie = (onDie) => {this.onDie = onDie; return this;}


    makeDamage = (value) => {
        this.hitPoints -= value;
        if (this.hitPoints <= 0) this.die();
        return this;
    }

    die = () => {
        this.setAlive(false);
        this.onDie.forEach((f) => f());
    }

    append = () => {
        Mob.getMobsArray().push(this);
        this.attackOrder();
    }
}

class Player extends GameObject {
    color = "#0b0";

    baseVelocity = 30;
    movingX = 0;
    movingY = 0;
    diagonalMovement = false;
    diagonalMovementCoef = Math.sqrt(2);

    moveX = (left, right) => {
        if (left === right) {
            this.movingX = 0;
            this.diagonalMovement = false;
        } else {
            this.movingX = left ? -1 : 1;
            this.diagonalMovement = this.movingY !== 0;
        }
    }

    moveY = (up, down) => {
        if (up === down) {
            this.movingY = 0;
            this.diagonalMovement = false;
        } else {
            this.movingY = up ? -1 : 1;
            this.diagonalMovement = this.movingX !== 0;
        }
    }

    update = () => {
        let dx = this.baseVelocity * this.movingX;
        let dy = this.baseVelocity * this.movingY;

        if (this.diagonalMovement) {
            dx /= this.diagonalMovementCoef;
            dy /= this.diagonalMovementCoef;
        }

        this.x += dx;
        this.y += dy;
    }
}
