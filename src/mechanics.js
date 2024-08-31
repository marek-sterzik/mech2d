import Body from "./body.js"

export default class Mechanics
{
    constructor()
    {
        this.frictionCoeficient = 1
        this.tQuantum = 0.01
        this.elasticityFactor = 1
        this.frictionFactor = 1
        this.maxVelocityAllowed = 0.0001
        this.maxAngularVelocityAllowed = 0.0001
        this.maxIterations = 1000
        this.initialIterations = 1
        this.bodies = {}
        this.recalcSpeeds()
    }

    addBody = (body) => {
        this.bodies[body.getId()] = body
        this.recalcSpeeds()
        return this
    }

    removeBody = (body) => {
        delete this.bodies[body.getId()]
    }

    solve = () => {
        var iterations = 0
        for (var i = 0; i < this.initialIterations; i++) {
            iterations++
            this.iteration()
        }
        while (this.maxVelocity > this.maxVelocityAllowed || this.maxAngularVelocity > this.maxAngularVelocityAllowed) {
            if (this.maxIterations !== null && this.maxIterations !== undefined && iterations >= this.maxIterations) {
                throw "maximum iterations reached"
            }
            iterations++
            this.iteration()
        }
        return iterations
    }

    iteration = () => {
        for (var id in this.bodies) {
            var body = this.bodies[id]
            var force = body.getAllLinksForce(this.elasticityFactor)
            body.applyFriction(this.frictionFactor, this.tQuantum)
            body.applyForce(force, this.tQuantum)
        }
        for (var id in this.bodies) {
            var body = this.bodies[id]
            body.move(this.tQuantum)
        }
        this.recalcSpeeds()
    }

    recalcSpeeds = () => {
        this.maxVelocity = 0
        this.maxAngularVelocity = 0
        for (var id in this.bodies) {
            var body = this.bodies[id]
            this.maxVelocity = Math.max(this.maxVelocity, body.velocity.size())
            this.maxAngularVelocity = Math.max(this.maxAngularVelocity, body.angularVelocity.rad())
        }
    }
}
