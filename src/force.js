export default class Force
{
    constructor(body, bodyPoint, forceVector)
    {
        this.body = body
        this.bodyPoint = bodyPoint
        this.forceVector = forceVector
    }

    apply = (tQuantum) => {
        const bodyPoint = this.bodyPoint()
        const force = this.forceVector()
        this.body.applyForce(force, bodyPoint, tQuantum)
        return force.size()
    }
}
