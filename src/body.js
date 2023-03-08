import {Point, Vector, Angle, Transformation} from "eeg2d"

export default class Body
{
    constructor(massCenter, mass, angularMomentum)
    {
        this.massCenter = Point.create(massCenter)
        this.mass = mass
        this.angularMomentum = angularMomentum
        this.track = Vector.zero()
        this.velocity = Vector.zero()
        this.angularTrack = Angle.zero()
        this.angularVelocity = Angle.zero()
        this.namedPoints = {}
        this.updateCurrentTransformation()
    }

    updateCurrentTransformation = () => {
        this.currentTransformation = Transformation.translate(this.track).compose(Transformation.rotate(this.angularTrack))
        this.currentInverseTransformation = this.currentTransformation.inv()
    }

    namedPoint = (name, ...argList) => {
        if (argList.length > 0) {
            this.namedPoints[name] = this.currentInverseTransformation.transformPoint(Point.create(...argList))
            return this
        } else {
            if (!(name in this.namedPoints)) {
                throw `named point of name $name does not exist`
            }
            return this.currentTransformation.transformPoint(this.namedPoints[name])
        }
    }

    pointToInvariant = (point) => {
        if (typeof forcePoint === 'string' || forcePoint instanceof String) {
            if (!(point in this.namedPoints)) {
                throw `named point of name $point does not exist`
            }
            point = this.namedPoinst[point]
        } else {
            point = this.currentInverseTransformation.transformPoint(point)
        }
        return point
    }

    invariantToPoint = (invariant) => {
        return this.currentTransformation.transformPoint(invariant)
    }

    moveByVector = (vector) => {
        this.track = this.track.add(vector)
        this.updateCurrentTransformation()
    }

    rotateByAngle = (angle) => {
        this.angularTrack = this.angularTrack.add(angle)
        this.updateCurrentTransformation()
    }

    applyForce = (forceVector, forcePoint, tQuantum) => {
        const massCenter = this.currentTransformation.transformPoint(this.massCenter)
        var excentricVector = massCenter.vectorTo(forcePoint)
        const forceRadius = excentricVector.size()
        excentricVector = excentricVector.normalize()
        const tangentialVector = excentricVector.rotate(Angle.right())
        const tangentialForceMomentum = tangentialVector.mul(forceVector) * forceRadius
        const excentricForce = excentricVector.mul(excentricVector.mul(forceVector))

        this.velocity = this.velocity.add(excentricForce.mul(tQuantum/this.mass))
        this.angularVelocity = this.angularVelocity.add(Angle.rad(tQuantum * tangentialForceMomentum/this.angularMomentum))
    }

    applyFriction = (frictionCoeficient, tQuantum) => {
        const multiplier = Math.exp(-frictionCoeficient*tQuantum)
        this.velocity = this.velocity.mul(multiplier)
        this.angularVelocity = this.angularVelocity.mul(multiplier)
    }

    move = (tQuantum) => {
        this.track = this.track.add(this.velocity.mul(tQuantum))
        this.angularTrack = this.angularTrack.add(this.angularVelocity.mul(tQuantum))
        this.updateCurrentTransformation()
    }
}
