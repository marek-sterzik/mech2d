var bodyLinkUniqueId = 1

import {Point} from "eeg2d"

const createPointGetter = (pointDef, body, myBody) => {
    if (!(pointDef instanceof Point)) {
        return () => { throw "cannot get opposite point" }
    }
    return () => myBody.universalToBodyCoords(body.bodyToUniversalCoords(pointDef))
}

const evaluatePoint = (body, pointDef, oppositeBody, oppositePointDef) => {
    if (pointDef instanceof Point) {
        return pointDef
    }
    if (pointDef instanceof Function) {
        return pointDef(body, createPointGetter(oppositePointDef, oppositeBody, body))
    }

    throw "Cannt evaluate invalid point definition"
}

export default class BodyLink
{
    constructor(body1, point1, body2, point2)
    {
        this.uniqid = bodyLinkUniqueId++
        this.body1 = body1
        this.body2 = body2
        this.point1 = point1
        this.point2 = point2
        Object.freeze(this)
    }

    getId()
    {
        return this.uniqid
    }

    getMyPoint(body)
    {
        if (this.body1 === body) {
            return evaluatePoint(this.body1, this.point1, this.body2, this.point2)
        }

        if (this.body2 === body) {
            return evaluatePoint(this.body2, this.point2, this.body1, this.point1)
        }

        throw "Bug happened"
    }

    getOppositePoint(body)
    {
        if (this.body1 === body) {
            return evaluatePoint(this.body2, this.point2, this.body1, this.point1)
        }

        if (this.body2 === body) {
            return evaluatePoint(this.body1, this.point1, this.body2, this.point2)
        }

        throw "Bug happened"
    }

    getOppositeBody(body)
    {
        if (this.body1 === body) {
            return this.body2
        }

        if (this.body2 === body) {
            return this.body1
        }

        throw "Bug happened"
    }

    getOppositePointInMyCoords(body)
    {
        const point = this.getOppositePoint(body)
        const oppositeBody = this.getOppositeBody(body)
        return body.universalToBodyCoords(oppositeBody.bodyToUniversalCoords(point))
    }
}
