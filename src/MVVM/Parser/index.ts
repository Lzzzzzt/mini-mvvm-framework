import MVVM from "../index";
import Subscriber from "../Subscriber";

/**
 * MVVM 框架的 Parser 部分，用于解析 Html
 */
export default class Parser {
    $frag: DocumentFragment
    $el: Element
    $context: MVVM

    /**
     * Parser 构造器，接收一个 Parser 运行上下文
     * @param context
     */
    constructor(context: MVVM) {
        // 保存上下文
        this.$context = context
        // 保存DOM元素
        this.$el = context.$el
        // DOM元素转换为Document Fragment
        this.$frag = this.node2frag(this.$el)
        // 模版解析
        this.parse(this.$frag)
        // Document Fragment 添加回 DOM 中
        this.$el.appendChild(this.$frag)
    }

    /**
     * 将挂载的 Html 节点转换为 DocumentFragment
     * @param node 挂载的节点
     */
    node2frag(node: Element): DocumentFragment {
        // 创建一个 DocumentFragment
        let frag = document.createDocumentFragment()

        if (node) {
            // 遍历 node 的子节点，忽略 TEXT 节点，换行符，注释
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE && /^[\r\n]/.test(child.textContent!)) {
                    return
                }
                if (child.nodeType === Node.COMMENT_NODE) {
                    return
                }
                frag.appendChild(child)
            })
        }

        return frag
    }

    /**
     * 解析 Html 节点
     * @param node 要解析的节点
     */
    parse(node: DocumentFragment | Element) {
        // 遍历 node 的子节点，只解析 TEXT 节点和 ELEMENT 节点
        node.childNodes.forEach(child => {
            switch (child.nodeType) {
                case Node.ELEMENT_NODE:
                    this.parseElementNode(child as Element)
                    break
                case Node.TEXT_NODE:
                    this.parseTextNode(child as Element)
                    break
            }
        })
    }

    /**
     * 解析元素节点
     * 主要解析各种指令
     * @param node 要解析的节点
     */
    parseElementNode(node: Element) {
        // 获取节点上所有的属性
        const attrs = node.attributes
        for (let i = 0; i < attrs.length; i++) {
            // 获得属性的名称和值
            const {name, value} = attrs[i]
            // 解析 m- 开头的属性
            if (name.startsWith('m-')) {
                // 指令的类型
                const directive = name.slice(2)

                // m-text 将 value 解析成 Html 内容
                if (directive.startsWith('text')) {
                    // 新增一个 value 的订阅者，当 value 变化时，能自动更新视图
                    new Subscriber(value, this.$context, newValue => {
                        node.textContent = newValue
                    })
                    // 在节点上移除这个属性
                    node.removeAttribute(name)
                }

                // m-model 双向绑定
                if (directive.startsWith('model')) {
                    this.handleModel(node, directive, name, value)
                }
                // m-bind 单向绑定
                if (directive.startsWith('bind')) {
                    this.handleBind(node, directive, name, value)
                }
            }
            // m-bind 单向绑定的简写
            if (name.startsWith(':')) {
                const directive = name.replace(':', 'bind:')
                this.handleBind(node, directive, name, value)
            }
            // m-model 双向绑定的简写
            if (name.startsWith('%')) {
                const directive = name.replace('%', 'model:')
                this.handleModel(node, directive, name, value)
            }
            // 事件监听器
            if (name.startsWith('@')) {
                // 事件监听器的类型
                const directive = name.replace('@', '')

                // 用于匹配有参数的函数的参数
                const pattern = /\((.*)\)/

                // 事件监听器的回调函数的名称
                const fn = value.split(pattern).shift()!

                // 事件监听器的回调函数的参数
                let args = value.match(pattern) ? value.match(pattern)![1].split(',') : null

                if (args !== null) {
                    // 去除参数中的空格
                    args = args!.map(v => v.trim())

                    // 根据监听器的类型为节点添加监听器
                    node.addEventListener(directive, () => {
                        // 调用函数
                        this.$context.$methods[fn](...args!.map(v => {
                            // 通过 new 一个函数对象的方法执行 with 语句，计算得到函数参数具体的值并返回
                            return new Function('context', `with(context) {return ${v}}`)(this.$context)
                        }))
                    })
                } else {
                    node.addEventListener(directive, () => {
                        this.$context.$methods[fn].call(this.$context)
                    })
                }
                // 在节点上移除这个属性
                node.removeAttribute(name)
            }
        }
        // 继续解析子节点
        this.parse(node)
    }

    /**
     * 解析 TEXT 节点，主要是双大括号语法
     * @param node 要解析的节点
     */
    parseTextNode(node: Element) {
        // 获取文本节点的内容
        let text = node.textContent?.trim()
        if (text !== undefined) {
            // 计算文本节点中的值得到表达式
            const expr = this.evaluateText(text)
            // 新增该表达式的订阅者，表达式更新时，视图自动更新
            new Subscriber(expr, this.$context, (newValue: string) => {
                node.textContent = newValue
            })
        }
    }

    /**
     * 分析文本
     * @param text 要分析的字符串
     */
    evaluateText(text: string): string {
        // 用于匹配双大括号语法
        const pattern = /\{\{(.+?)}}/g
        // 区分双大括号语法，和正常文本
        let tokens = text.split(pattern)
        const matches = text.match(pattern)

        tokens = tokens
            .filter(value => {
                // 过滤掉无效的token
                return value.length
            })
            .map(value => {
                // 如果存在双大括号语法，则将其中表达式用小括号包裹起来，便于后期计算其值
                if (matches && matches.indexOf(`{{${value}}}`) !== -1) {
                    return `(${value})`
                } else {
                    // 反之，则直接返回其字符串形式
                    return `"${value}"`
                }
            })
        // 将 tokens 转换成字符串拼接形式
        return tokens.join('+')
    }

    /**
     * 处理 m-model 指令和 '%' 指令
     * @param node 当前节点
     * @param directive 指令
     * @param name 属性名称，用于在 Html 元素上移除该属性
     * @param value 属性值，即绑定的变量
     */
    handleModel(node: Element, directive: string, name: string, value: string) {
        // 这里将节点转换成 HTMLInputElement 类型是因为在 TypeScript 中该类型有 .value 属性
        const element = node as HTMLInputElement
        // 要绑定的属性，可以为空，默认为 value
        const attr = directive.split(':').pop()

        if (attr !== 'model') {
            // 存在要绑定的属性
            // 为绑定的 变量 添加订阅者，自动更新视图
            new Subscriber(value, this.$context, newValue => {
                // @ts-ignore
                element[attr] = newValue
            })
            // 监听 input 事件实现双向绑定
            element.addEventListener('input', ev => {
                // @ts-ignore
                this.$context.$data[value] = (ev.target as HTMLInputElement)[attr]
            })
        } else {
            // 不存在要绑定的属性，使用默认的 value 属性
            // 为绑定的 变量 添加订阅者，自动更新视图
            new Subscriber(value, this.$context, newValue => {
                element.value = newValue
            })
            // 监听 input 事件实现双向绑定
            element.addEventListener('input', ev => {
                this.$context.$data[value] = (ev.target as HTMLInputElement).value
            })
        }
        // 在 Html 节点上移除该属性
        node.removeAttribute(name)
    }

    /**
     * 处理 m-bind 指令 和 ':' 指令
     * @param node 当前节点
     * @param directive 指令
     * @param name 属性名称，用于在 Html 元素上移除该属性
     * @param value 属性值，即绑定的变量
     */
    handleBind(node: Element, directive: string, name: string, value: string) {
        // 要绑定的属性，可以为空，默认为 value
        const attr = directive.split(':').pop()

        if (attr !== 'bind') {
            // 存在要绑定的属性
            // 为绑定的 变量 添加订阅者，自动更新视图
            new Subscriber(value, this.$context, newValue => {
                // @ts-ignore
                node[attr] = newValue
            })
        } else {
            // 不存在要绑定的属性，使用默认的 value 属性
            // 为绑定的 变量 添加订阅者，自动更新视图
            new Subscriber(value, this.$context, newValue => {
                // @ts-ignore
                node['value'] = newValue
            })
        }
        // 在 Html 节点上移除该属性
        node.removeAttribute(name)
    }
}
