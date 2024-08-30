import {Vector} from "eeg2d"

export default class Momentum
{
    static zero()
    {
        return new Momentum(0, Vector.zero())
    }

    constructor(momentum, vector)
    {
        this.momentum = momentum
        this.vector = vector
        Object.freeze(this)
    }

    add = (momentum) => new Momentum(this.momentum + momentum.momentum, this.vector.add(momentum.vector))
    sub = (momentum) => new Momentum(this.momentum - momentum.momentum, this.vector.sub(momentum.vector))
    mul = (momentumScalar, vectorScalar = undefined) => {
        if (vectorScalar === undefined || vectorScalar === null) {
            vectorScalar = momentumScalar
        }
        return new Momentum(this.momentum * momentumScalar, this.vector.mul(vectorScalar))
    }
}
