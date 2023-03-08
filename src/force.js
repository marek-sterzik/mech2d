export default class Force
{
    constructor(body, bodyPoint, staticPoint, forceFactor)
    {
        this.body = body
        this.bodyPoint = bodyPoint
        this.staticPoint = staticPoint
        this.forceFactor = forceFactor
    }

    apply = (tQuantum) => {
        const bodyPoint = this.bodyPoint()
        const staticPoint = this.staticPoint()
        const force = bodyPoint.vectorTo(staticPoint).mul(this.forceFactor)
        this.body.applyForce(force, bodyPoint, tQuantum)
        return force.size()
    }
}
