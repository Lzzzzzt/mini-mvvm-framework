import {Data, Methods, Options} from "./Types";
import Publisher from "./Publisher";
import Parser from "./Parser";

/**
 * MVVM 主体部分
 */
export default class MVVM {
    public $el: Element
    public $data: Data
    public $methods: Methods
    public $publisher: Publisher
    public $parser: Parser

    /**
     * MVVM 构造器，接收一个 options 参数
     * @param options
     */
    constructor(options: Options) {
        // 获取DOM对象
        this.$el = document.querySelector(options.el)!
        // 获取数据
        this.$data = options.data
        // 获取方法
        this.$methods = options.methods ? options.methods : {}
        // 数据代理
        this.proxyData()
        // 方法代理
        this.proxyMethods()
        // 数据劫持
        this.$publisher = new Publisher(this.$data)
        // 模版解析
        this.$parser = new Parser(this)
    }

    /**
     * 将 this.$data 中的值代理到 this 上
     */
    proxyData() {
        // 遍历 this.$data
        Object.keys(this.$data).forEach(k => {
            // 设置 getter 和 setter
            Object.defineProperty(this, k, {
                configurable: true,
                enumerable: true,
                set(v: any) {
                    this.$data[k] = v
                },
                get(): any {
                    return this.$data[k]
                }
            })
        })
    }

    /**
     * 将 this.$methods 中的方法代理到 this 上
     */
    proxyMethods() {
        Object.keys(this.$methods).forEach(k => {
            // 修改方法中this的指向
            this.$methods[k] = this.$methods[k].bind(this)

            Object.defineProperty(this, k, {
                configurable: true,
                enumerable: true,
                get(): any {
                    return this.$methods[k]
                }
            })
        })
    }
}
