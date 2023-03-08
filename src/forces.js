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

const createNearestArcPointFunction = (point, arcCenter, arcPoint1, arcPoint2) => {
    return () => {
        const arcCenterPoint = arcCenter()
        const pointVector = arcCenterPoint.vectorTo(point())
        const arcPoint1Vector = arcCenterPoint.vectorTo(arcPoint1())
        const arcPoint2Vector = arcCenterPoint.vectorTo(arcPoint2())
        const ortho1Vector = arcPoint1Vector.normalize().rot(Angle.right())
        const ortho2Vector = arcPoint2Vector.normalize().rot(Angle.right().mul(-1))
        
        const positive1 = (pointVector.mul(ortho1Vector) < 0) ? false : true
        const positive2 = (pointVector.mul(ortho2Vector) < 0) ? false : true
        const bigAngle = (arcPoint2Vector.mul(ortho1Vector) < 0) ? true : false

        const insideArc = (positive1 && positive2) || bigAngle && (positive1 || positive2)

        if (insideArc) {
            return arcCenterPoint.addVector(pointVector.normalize().mul(arcPoint1Vector.size()))
        } else if (positive1) {
            return arcCenterPoint.addVector(arcPoinst2Vector)
        } else if (positive2) {
            return arcCenterPoint.addVector(arcPoinst1Vector)
        } else {
            const splitVector = ortho1Vector.add(ortho2Vector).normalize().rot(Angle.right())
            if (pointVector.mul(splitVector) > 0) {
                return arcCenterPoint.addVector(arcPoinst2Vector)
            } else {
                return arcCenterPoint.addVector(arcPoinst1Vector)
            }
        }
    }
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
            new Force(body, pointFunction, createLinearForceFunction(pointFunction, staticPointFunction, orthoVector, forceFactor)),
        ]
    }

    static arcBindingForce(body1, point1, body2, arcCenter, arcPoint1, arcPoint2)
    {
        const point1Function = createPointFunction(body1, point1)
        const arcCenterFunction = createPointFunction(body2, arcCenter)
        const arcPoint1Function = createPointFunction(body2, arcPoint1)
        const arcPoint2Function = createPointFunction(body2, arcPoint2)
        const nearestArcPointFunction = createNearestArPointFunction(point1Function, arcCenterFunction, arcPoint1Function, arcPoint2Function)
        return [
            new Force(body1, point1Function, createForceFunction(point1Function, nearestArcPointFunction, forceFactor)),
            new Force(body2, nearestArcPointFunction, createForceFunction(nearestArcPointFunction, point1Function, forceFactor)),
        ]
    }
}
