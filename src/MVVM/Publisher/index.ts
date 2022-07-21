import {Data} from "../Types";
import Subscribe from "../Subscribe";

/**
 * MVVM 框架中的 Publisher，用于收集依赖及发布更新
 */
export default class Publisher {
    data: Data

    /**
     * Publisher 构造器
     * @param data 要劫持的 Data 对象
     */
    constructor(data: Data) {
        this.data = data
        this.traversal(null, this.data, 1)
    }

    /**
     * 遍历整个 Data 对象，并为其及其后代添加响应式
     * @param parent
     * @param data
     * @param depth
     */
    traversal(parent: Data | null, data: Data, depth: number) {
        data.__parent__ = parent

        // 遍历 data 中的属性
        Object.keys(data).forEach(k => {
            if (k !== '__parent__') {
                // 添加响应式
                this.reactive(data, k, data[k])
                // 如果该属性的值为对象，则递归遍历
                if (typeof data[k] === 'object') {
                    this.traversal(data, data[k], depth + 1)
                }
            }
        })
    }

    /**
     * 为目标添加响应式
     * @param d Data 对象
     * @param k Data 对象中该属性的 key
     * @param v Data 对象中该属性的 value
     */
    reactive(d: Data, k: string | number, v: any) {
        // 新增订阅
        const subscribe = new Subscribe()
        Object.defineProperty(d, k, {
            configurable: true,
            enumerable: true,
            get(): any {
                Subscribe.target && subscribe.add(Subscribe.target)
                return v
            },
            set(newValue: any) {
                v = newValue
                // 发布更新
                subscribe.publish()
            }
        })
    }
}
