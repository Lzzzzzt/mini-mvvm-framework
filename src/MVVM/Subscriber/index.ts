import MVVM from "../index";
import Subscribe from "../Subscribe";

type SubscriberCallBack = (v: any) => void

export default class Subscriber {
    id: Symbol
    expr: string
    context: MVVM
    callback: SubscriberCallBack

    constructor(expr: string, context: MVVM, callback: SubscriberCallBack) {
        this.expr = expr
        this.context = context
        this.callback = callback
        this.id = Symbol('Subscriber ID')

        this.update()
    }

    getCurrentValue(): string {
        Subscribe.target = this

        const val = new Function('context', `
            with(context) {
                return ${this.expr}
            }
        `)(this.context)

        Subscribe.target = null
        return val
    }

    update() {
        this.callback(this.getCurrentValue())
    }
}
