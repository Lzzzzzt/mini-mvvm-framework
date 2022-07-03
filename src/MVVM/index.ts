import {Data, Methods, Options} from "./types";
import Publisher from "./Publisher";
import Parser from "./Parser";

export default class MVVM {
    public $el: Element
    public $data: Data
    public $methods: Methods

    constructor(options: Options) {
        // 获取DOM对象
        this.$el = document.querySelector(options.el)!
        // 获取数据
        this.$data = options.data
        // 获取方法
        this.$methods = options.methods ? options.methods : {}
        // 数据代理
        this.proxyData(this.$data)
        // 方法代理
        this.proxyMethods(this.$methods)
        // 数据劫持
        new Publisher(this.$data)
        // 模版解析
        new Parser(this)
    }

    proxyData(data: Data) {
        Object.keys(data).forEach(k => {
            Object.defineProperty(this, k, {
                configurable: true,
                set(v: any) {
                    data[k] = v
                },
                get(): any {
                    return data[k]
                }
            })
        })
    }

    proxyMethods(methods: Methods) {
        Object.keys(methods).forEach(k => {
            Object.defineProperty(this, k, {
                get(): any {
                    return methods[k]
                }
            })
        })
    }
}
