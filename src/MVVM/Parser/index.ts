import MVVM from "../index";
import Subscriber from "../Subscriber";

export default class Parser {
    $frag: DocumentFragment
    $el: Element
    $context: MVVM

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
        this.$context.$el.appendChild(this.$frag)
    }

    node2frag(node: Element): DocumentFragment {
        let frag = document.createDocumentFragment()

        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && /^[\r\n]/.test(child.textContent!)) {
                return
            }
            if (child.nodeType === Node.COMMENT_NODE) {
                return
            }

            frag.appendChild(child)
        })

        return frag
    }

    parse(node: DocumentFragment | Element) {
        node.childNodes.forEach(child => {
            switch (child.nodeType) {
                case Node.ELEMENT_NODE:
                    this.parseElementNode(child as Element)
                    break
                case Node.TEXT_NODE:
                    this.parseTextNode(child as Element)
                    break
                default:
                    return
            }
        })
    }

    parseElementNode(node: Element) {
        // TODO: 指令解析
        const attrs = node.attributes
        for (let i = 0; i < attrs.length; i++) {
            const {name, value} = attrs[i]
            if (name.startsWith('m-')) {
                const directive = name.slice(2)

                if (directive.startsWith('text')) {
                    new Subscriber(value, this.$context, newValue => {
                        node.textContent = newValue
                    })

                    node.removeAttribute(name)
                }

                if (directive.startsWith('model')) {
                    this.handleModel(node, directive, name, value)
                }

                if (directive.startsWith('bind')) {
                    this.handleBind(node, directive, name, value)
                }

                // console.log(this.$context)
            }

            if (name.startsWith(':')) {
                const directive = name.replace(':', 'bind:')
                this.handleBind(node, directive, name, value)
            }

            if (name.startsWith('%')) {
                const directive = name.replace('%', 'model:')
                this.handleModel(node, directive, name, value)
            }

            // TODO: 函数解析和事件解析
        }
        this.parse(node)
    }

    parseTextNode(node: Element) {
        let text = node.textContent?.trim()
        if (text !== undefined) {
            const expr = this.evaluateText(text)
            new Subscriber(expr, this.$context, (newValue: string) => {
                node.textContent = newValue
            })
        }
    }

    evaluateText(text: string): string {
        const pattern = /\{\{(.+?)}}/g
        let tokens = text.split(pattern)
        const matches = text.match(pattern)
        tokens = tokens.filter(value => value.length).map(value => {
            if (matches && matches.indexOf(`{{${value}}}`) !== -1) {
                return `(${value})`
            } else {
                return `"${value}"`
            }
        })

        return tokens.join('+')
    }

    handleModel(node: Element, directive: string, name: string, value: string) {
        const input = node as HTMLInputElement
        const attr = directive.split(':').pop()

        if (attr !== 'model') {
            new Subscriber(value, this.$context, newValue => {
                // @ts-ignore
                input[attr] = newValue
                // console.log(newValue)
            })

            input.addEventListener('input', ev => {
                // @ts-ignore
                this.$context.$data[value] = (ev.target as HTMLInputElement)[attr]
                // console.log('v', (ev.target as HTMLInputElement).value)
            })
        } else {
            new Subscriber(value, this.$context, newValue => {
                input.value = newValue
                // console.log(newValue)
            })

            input.addEventListener('input', ev => {
                this.$context.$data[value] = (ev.target as HTMLInputElement).value
                // console.log('v', (ev.target as HTMLInputElement).value)
            })
        }
        node.removeAttribute(name)
    }

    handleBind(node: Element, directive: string, name: string, value: string) {
        const attr = directive.split(':').pop()
        // console.log('attr', attr)

        if (attr !== 'bind') {
            new Subscriber(value, this.$context, newValue => {
                // @ts-ignore
                node[attr] = newValue
                // console.log(newValue)
            })
        } else {
            new Subscriber(value, this.$context, newValue => {
                // @ts-ignore
                node['value'] = newValue
                // console.log(newValue)
            })

        }
        node.removeAttribute(name)
    }
}
