import Body from "./body.js"

const createPointFunction = (body, point) => {
    const invariant = body.pointToInvariant(point)
    return () => body.invariantToPoint(invariant)
}

const createStaticPointFunction = (mechanics, staticPoint) => {
    if (typeof staticPoint === 'string' || staticPoint instanceof String) {
        return () => mechanics.namedPoint(staticPoint)
    } else {
        return () => staticPoint
    }
}

export default class Mechanics
{
    constructor()
    {
        this.frictionCoeficient = 1
        this.tQuantum = 0.01
        this.forceFactor = 1
        this.bodies = {}
        this.forces = []
        this.namedPoints = {}
    }

    body = (name, ...argList) => {
        if (argList.length > 0) {
            if (name in this.bodies) {
                throw `body of name $name already exists`
            }
            this.bodies[name] = new Body(...argList)
            return this
        } else {
            if (!(name in this.bodies)) {
                throw `body of name $name does not exist`
            }
            return this.bodies[name]
        }
    }

    bindingForce = (body1, point1, body2, point2) => {
        body1 = this.body(body1)
        body2 = this.body(body2)
        const point1Function = createPointFucntion(body1, point1)
        const point2Function = createPointFucntion(body2, point2)
        this.forces.push(new Force(body1, point1Function, point2Function, this.forceFactor))
        this.forces.push(new Force(body2, point2Function, point1Function, this.forceFactor))
    }

    staticForce = (body, point, staticPoint) => {
        body = this.body(body)
        const pointFunction = createPointFunction(body, point)
        const staticPointFunction = createStaticPointFunction(this, staticPoint)
        this.forces.push(new Force(body, pointFucntion, staticPointFunction, this.forceFactor))
    }

    namedPoint = (name, ...argList) => {
        if (argList.length > 0) {
            this.namedPoints[name] = Point.create(...argList)
            return this
        } else {
            if (!(name in this.namedPoints)) {
                throw `named point of name $name does not exist`
            }
            return this.namedPoints[name]
        }
    }

    applyFriction = () => {
        for (var body of this.bodies) {
            body.applyFriction(this.frictionCoeficient, this.tQuantum)
        }
    }

    applyForces = () => {
        var maxForce = 0
        for (var force of this.forces) {
            maxForce = Math.max(maxForce, force.apply(this.tQuantum))
        }
        return maxForce
    }

    doMoves = () => {
        for (var body of this.bodies) {
            body.move(this.tQuantum)
        }
    }

    step = () => {
        this.applyFriction()
        this.applyForces()
        this.doMoves()
    }
}
