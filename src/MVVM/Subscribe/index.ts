import Subscriber from "../Subscriber";

/**
 * MVVM 框架中的 Subscribe，Publisher 通过该类发布更新
 */
export default class Subscribe {
    static target: Subscriber | null = null
    subscriber: Map<Symbol, Subscriber>

    constructor() {
        this.subscriber = new Map<Symbol, Subscriber>()
    }

    /**
     * 添加订阅者
     * @param target
     */
    add(target: Subscriber) {
        this.subscriber.set(target.id, target)
    }

    /**
     * 发布更新
     */
    publish() {
        this.subscriber.forEach(value => {
            value.update()
        })
    }
}
