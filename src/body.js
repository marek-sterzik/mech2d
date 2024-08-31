import {Point, Vector, Angle, Transformation} from "eeg2d"
import BodyLink from "./link.js"
import Momentum from "./momentum.js"


const getForceMyCoords = (forceVector, forcePoint) => {
    const massCenter = Point.origin()
    var excentricVector = massCenter.vectorTo(forcePoint)
    const forceRadius = excentricVector.size()
    excentricVector = excentricVector.normalize()
    const tangentialVector = excentricVector.rot(Angle.right())
    const tangentialForceMomentum = tangentialVector.mul(forceVector) * forceRadius
    const excentricForce = excentricVector.mul(excentricVector.mul(forceVector))
    return new Momentum(tangentialForceMomentum, forceVector)
}

class UniversalPseudoBody
{
    universalToBodyCoords = (vectorOrPoint) => vectorOrPoint
    bodyToUniversalCoords = (vectorOrPoint) => vectorOrPoint
}

const universalPseudoBody = new UniversalPseudoBody()

var uniqueBodyId = 1

export default class Body
{
    constructor(massCenter, mass = 1, angularMomentum = 1)
    {
        this.id = uniqueBodyId++
        this.mass = mass
        this.angularMomentum = angularMomentum
        this.track = Point.origin().vectorTo(Point.create(massCenter))
        this.velocity = Vector.zero()
        this.angularTrack = Angle.zero()
        this.angularVelocity = Angle.zero()
        this.links = {}
        this.updateCurrentTransformation()
    }

    getId = () => this.id

    updateCurrentTransformation = () => {
        this.currentTransformation = Transformation.translate(this.track).compose(Transformation.rotate(this.angularTrack))
        this.currentInverseTransformation = this.currentTransformation.inv()
    }

    universalToBodyCoords = (vectorOrPoint) => this.currentInverseTransformation.transform(vectorOrPoint)
    bodyToUniversalCoords = (vectorOrPoint) => this.currentTransformation.transform(vectorOrPoint)

    link = (body2, point, point2 = undefined) => {
        if (point2 === undefined  || point2 === null) {
            point2 = point
        }

        if (body2 === undefined || body2 === null) {
            body2 = universalPseudoBody
        }
        if (point instanceof Point) {
            point = this.universalToBodyCoords(point)
        }
        if (point2 instanceof Point) {
            point2 = body2.universalToBodyCoords(point2)
        }
        const link = new BodyLink(this, point, body2, point2)
        const linkId = link.getId()
        this.links[linkId] = link
        if (!(body2 instanceof UniversalPseudoBody)) {
            body2.links[linkId] = link
        }
        return link
    }

    unlink = (link) => {
        const id = link.getId()
        if (id in this.links) {
            delete this.links[id]
        }
        const oppositeBody = link.getOppositeBody(this)
        if (!(oppositeBody instanceof UniversalPseudoBody)) {
            delete oppositeBody.links[id]
        }
        return this
    }

    move = (tQuantum) => {
        this.track = this.track.add(this.velocity.mul(tQuantum))
        this.angularTrack = this.angularTrack.add(this.angularVelocity.mul(tQuantum))
        this.updateCurrentTransformation()
        return this
    }

    applyFriction = (frictionFactor, tQuantum) => {
        const multiplier = Math.exp(-frictionFactor * tQuantum)
        this.velocity = this.velocity.mul(multiplier)
        this.angularVelocity = this.angularVelocity.mul(multiplier)
        return this
    }

    getForce = (forceVector, forcePoint) => {
        return getForceMyCoords(this.universalToBodyCoords(forceVector), this.universalToBodyCoords(forcePoint))
    }

    getLinkForce = (link, elasticityFactor = 1) => {
        const id = link.getId()
        if (!(id in this.links)) {
            return Momentum.zero()
        }
        const forcePoint = link.getMyPoint(this)
        const oppositePoint = link.getOppositePointInMyCoords(this)
        return getForceMyCoords(forcePoint.vectorTo(oppositePoint).mul(elasticityFactor), forcePoint)
    }

    getAllLinksForce = (elasticityFactor = 1) => {
        var force = null
        for (var linkId in this.links) {
            var link = this.links[linkId]
            var currentForce = this.getLinkForce(link, elasticityFactor)
            if (force === null) {
                force = currentForce
            } else {
                force = force.add(currentForce)
            }
        }
        if (force === null) {
            force = Momentum.zero()
        }
        return force
    }

    applyForce = (force, tQuantum) => {
        var deltaVelocity = force.mul(tQuantum/this.angularMomentum, tQuantum/this.mass)
        this.velocity = this.velocity.add(deltaVelocity.vector)
        this.angularVelocity = this.angularVelocity.add(Angle.rad(deltaVelocity.momentum))
        return this
    }
}
