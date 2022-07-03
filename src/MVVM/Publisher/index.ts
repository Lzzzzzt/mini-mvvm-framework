import {Data} from "../types";
import Subscribe from "../Subscribe";

export default class Publisher {
    data: Data
    constructor(data: Data) {
        this.data = data
        this.traversal(this.data)
    }
    traversal(data: Data) {
        if (!data) {
            return
        }

        Object.keys(data).forEach(k => {
            this.reactive(data, k, data[k])
            if (typeof data[k] === 'object') {
                this.traversal(data[k])
            }
        })
    }

    reactive(d: Data, k: string | symbol, v: any) {
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
                subscribe.publish()
            }
        })
    }
}
