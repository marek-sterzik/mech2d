import Body from "./body.js"

export default class Mechanics
{
    constructor()
    {
        this.maxIterations = 1000
        this.initialIterations = 1
        this.bodies = {}
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
        var i = 0
        while (this.maxIterations === null || i < this.maxIterations) {
            for (var bodyId in this.bodies) {
                var body = this.bodies[bodyId]
                body.move(false)
            }
            var stable = true
            for (var bodyId in this.bodies) {
                var body = this.bodies[bodyId]
                if (!body.commitMove()) {
                    stable = false
                }
            }
            if (stable) {
                break;
            }
            i++
        }
        return i + 1
    }
}
