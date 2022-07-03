import Subscriber from "../Subscriber";

export default class Subscribe {
    static target: Subscriber | null = null
    subscriber: Map<Symbol, Subscriber>

    constructor() {
        this.subscriber = new Map<Symbol, Subscriber>()
    }

    add(target: Subscriber) {
        this.subscriber.set(target.id, target)
    }

    publish() {
        this.subscriber.forEach(value => {
            value.update()
        })
    }
}
