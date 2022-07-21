import MVVM from "../index";
import Subscribe from "../Subscribe";
import {SubscriberCallBack} from "../Types";


/**
 * MVVM 框架中的 Subscriber
 */
export default class Subscriber {
    id: Symbol
    expr: string
    context: MVVM
    callback: SubscriberCallBack

    /**
     * Subscriber 的构造器
     * @param expr 要订阅的值
     * @param context 程序上下文
     * @param callback 用来更新视图的回调函数
     */
    constructor(expr: string, context: MVVM, callback: SubscriberCallBack) {
        this.expr = expr
        this.context = context
        this.callback = callback
        this.id = Symbol('Subscriber ID')
        // 初始时更新
        this.update()
    }

    /**
     * 获取当前订阅的值
     */
    getCurrentValue(): string {
        // 确定当前订阅者，使 Publisher 在收集依赖的时候确定订阅者，并将该订阅者添加到订阅中心
        Subscribe.target = this

        // 在指定的上下文中获取现在订阅的值，此时 Publisher 会进行依赖收集
        const val = new Function('context', `
            with(context) {
                return ${this.expr}
            }
        `)(this.context)

        // 当前订阅者置空，方便下一个订阅者开始订阅
        Subscribe.target = null
        // 返回当前订阅的值
        return val
    }

    /**
     * 更新视图
     */
    update() {
        // 利用回调函数更新视图
        this.callback(this.getCurrentValue())
    }
}
