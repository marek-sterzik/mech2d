#!/usr/bin/node

import {Mechanics, Body} from "./src/mech2d.js";
import {Point, Vector, Angle} from "eeg2d"

//var mechanics = new Mechanics()
//

var body = new Body(Point.origin())
var body2 = new Body(Point.create(1, 1))
var body3 = new Body(Point.create(-1, 11))
var link = body.link(body2, Point.create(1, 0), (body) => body.universalToBodyCoords(Point.create(1, 1)))
var link2 = body.link(body3, Point.create(-1, 0), Point.create(-1, -1))

var force = body.getAllLinksForce()

console.log(force)
//var body2 = new Body(Point.origin(), 1, 1)

//var link = body.link(body2, Point.create(2, 2))

//console.log(body.links)

//body.unlink(link)

//console.log(body.links)
