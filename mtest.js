#!/usr/bin/node

import {Mechanics, Body} from "./src/mech2d.js";
import {Point, Vector, Angle} from "eeg2d"

function log(i, point1, point2, body)
{
    const size = point1().vectorTo(point2()).size()
    console.log(i+1, point1().toString(), point2().toString(), size)
}

//var mechanics = new Mechanics()

var body = new Body(Point.create(0, 1))
body.link(Point.create(0, 0), Point.create(0, 0), 1)
body.link(Point.create(0, 2), Point.create(2, 0), 1)

var point1 = body.getPoint(Point.create(0, 0))
var point2 = body.getPoint(Point.create(2, 0))

var stable = true
var i
for(i = 0; i < 1000; i++) {
    log(i, point1, point2, body)
    body.move(false)
    stable = body.commitMove()
    if (stable) {
        break;
    }
}
if (stable) {
    console.log("finished in " + (i+1) + " steps")
} else {
    console.log("finished unstable")
}
log(i, point1, point2)

