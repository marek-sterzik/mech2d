import Body from "./body.js"
import Forces from "./forces.js"

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
        this.forces.push(...Forces.bindingForce(this.body(body1), point1, this.body(body2), point2, this.forceFactor))
    }

    staticForce = (body, point, staticPoint) => {
        this.forces.push(...Forces.staticForce(this.body(body), point, this.staticPointFunction(staticPoint), this.forceFactor))
    }

    linearForce = (body, point, staticPoint, staticVector) => {
        this.forces.push(...Forces.linearForce(this.body(body), point, this.staticPointFunction(staticPoint), staticVector, this.forceFactor))
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

    staticPointFunction = (point) => {
        if (typeof staticPoint === 'string' || staticPoint instanceof String) {
            const mechanics = this
            return () => mechanics.namedPoint(staticPoint)
        } else {
            return () => staticPoint
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
