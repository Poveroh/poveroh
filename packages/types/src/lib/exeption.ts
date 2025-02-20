class BaseCustomError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class Warning extends BaseCustomError {
    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, Warning.prototype)
    }
}
