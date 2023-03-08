import Force from "./force.js"
import {Angle} from "eeg2d"

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

const createForceFunction = (point1Function, point2Function, forceFactor) => {
    return () => point1Function().vectorTo(point2Function()).mul(forceFactor)
}

const createLinearForceFunction = (pointFunction, staticPointFunction, orthoVector, forceFactor) => {
    return () => orthoVector.mul(pointFunction().vectorTo(staticPointFunction()).mul(orthoVector)).mul(forceFactor)
}


export default class Forces
{
    static bindingForce(body1, point1, body2, point2, forceFactor)
    {
        const point1Function = createPointFucntion(body1, point1)
        const point2Function = createPointFucntion(body2, point2)
        return [
            new Force(body1, point1Function, createForceFunction(point1Function, point2Function, forceFactor)),
            new Force(body2, point2Function, createForceFunction(point2Function, point1Function, forceFactor)),
        ]
    }

    static staticForce(body, point, staticPointFunction, forceFactor)
    {
        const pointFunction = createPointFunction(body, point)
        return [
            new Force(body, pointFucntion, createForceFunction(pointFunction, staticPointFunction, forceFactor)),
        ]
    }

    static linearForce(body, point, staticPointFunction, staticVector, forceFactor)
    {
        if (staticVector.isZero()) {
            return Forces.staticForce(body, point, staticPointFunction, forceFactor)
        }
        const pointFunction = createPointFunction(body, point)
        const orthoVector = staticVector.rot(Angle.right()).normalize()
        return [
            new Force(body, pointFunction, createLinearForceFunction(pointFunction, staticPointFunction, orthoVector, forceFactor))
        ]
    }
}
