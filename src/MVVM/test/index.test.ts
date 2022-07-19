import MVVM from "../index";

test('Test MVVM (Data Proxy)', () => {
    document.body.innerHTML = `
        <div id="app"></div>
    `

    const vm = new MVVM({
        el: '#app',
        data: {
            a: 1,
            b: 2,
            c: [1, 2],
            d: {
                e: [1, 3]
            }
        },
        methods: {}
    })

    // 测试 vm 中代理的数据是否和 vm.$data 中的是否相等
    for (const attr in vm.$data) {
        expect(vm).toHaveProperty(attr)
        // @ts-ignore
        expect(vm[attr]).toBe(vm.$data[attr])
    }

    // 测试修改 vm.$data 中的数据后，vm 中代理的数据和 vm.$data 中的数据是否相等
    vm.$data['a'] = 222
    for (const attr in vm.$data) {
        expect(vm).toHaveProperty(attr)
        // @ts-ignore
        expect(vm[attr]).toBe(vm.$data[attr])
    }

    // 测试修改 vm 中代理的数据后，vm 中代理的数据和 vm.$data 中的数据是否相等
    // @ts-ignore
    vm['b'] = 333
    for (const attr in vm.$data) {
        expect(vm).toHaveProperty(attr)
        // @ts-ignore
        expect(vm[attr]).toBe(vm.$data[attr])
    }
})

test('Test MVVM (Function Proxy)', () => {
    document.body.innerHTML = `
        <div id="app"></div>
    `

    const vm = new MVVM({
        el: '#app',
        data: {},
        methods: {
            hello() {
                alert("Hello")
            },
            world() {
                return 'world'
            }
        }
    })

    // 测试 vm 中代理的方法是否和 vm.$methods 中的是否相等
    for (const attr in vm.$methods) {
        expect(vm).toHaveProperty(attr)
        // @ts-ignore
        expect(vm[attr]).toBe(vm.$methods[attr])
    }
})

test('Test Parser (m-text directive and Mustache)', () => {
    document.body.innerHTML = `
    <div id="app">
        <div m-text="a" id="test-parser-m-text"></div>
        <!-- comment -->
        <span id="test-parser-mustache">{{ b }} - {{ a }}</span>
    </div>
    `

    const vm = new MVVM({
        el: '#app',
        data: {
            a: "Hello, world",
            b: "MVVM"
        },
        methods: {}
    })

    // 测试m-text指令和双大括号语法是否解析正常且生效
    expect(vm.$data['a']).toEqual(document.querySelector('#test-parser-m-text')!.innerHTML)
    expect(`${vm.$data['b']} - ${vm.$data['a']}`).toEqual(document.querySelector('#test-parser-mustache')!.innerHTML)
})

test('Test Parser (m-bind directive)', () => {
    document.body.innerHTML = `
    <div id="app">
        <div :id="a"></div>
        <!-- comment -->
        <span m-bind:id="b">{{ b }}</span>
        <input type="text" m-bind="a" id="test-parser-bind-default">
    </div>
    `

    const vm = new MVVM({
        el: '#app',
        data: {
            a: "Hello",
            b: "MVVM"
        },
        methods: {}
    })

    // 测试m-bind指令和':'语法是否解析正常且生效
    expect(document.getElementById(vm.$data['a'])).toBeDefined()
    expect(document.getElementById(vm.$data['b'])).toBeDefined()

    // 测试单向绑定
    vm.$data['a'] = 'abc'
    expect(document.getElementById(vm.$data['a'])).toBeDefined()

    vm.$data['b'] = 'bcd'
    expect(document.getElementById(vm.$data['b'])).toBeDefined()

    // 测试m-bind绑定的默认值
    const input = document.getElementById('test-parser-bind-default')! as HTMLInputElement
    expect(input.value).toEqual(vm.$data['a'])

    vm.$data['a'] = "cde"
    expect(input.value).toEqual(vm.$data['a'])
})

test('Test Parser (m-model directive)', () => {
    document.body.innerHTML = `
    <div id="app">
        <input m-model="a" id="test-parser-m-model-a"/>
        <!-- comment -->
        <input %value="b" id="test-parser-m-model-b"/>
    </div>
    `
    const vm = new MVVM({
        el: '#app',
        data: {
            a: "Hello",
            b: "MVVM"
        },
        methods: {}
    })

    const elemA = document.getElementById('test-parser-m-model-a')! as HTMLInputElement
    const elemB = document.getElementById('test-parser-m-model-b')! as HTMLInputElement

    // 测试m-model指令和'%'语法是否解析正常且生效
    expect(elemA.value).toEqual(vm.$data['a'])
    expect(elemB.value).toEqual(vm.$data['b'])

    // 测试双向绑定
    vm.$data['a'] = '123'
    expect(elemA.value).toEqual(vm.$data['a'].toString())

    elemA.value = '666'
    elemA.dispatchEvent(new InputEvent('input'))
    expect(elemA.value).toEqual(vm.$data['a'].toString())

    vm.$data['b'] = 234
    expect(elemB.value).toEqual(vm.$data['b'].toString())

    elemB.value = '888'
    elemB.dispatchEvent(new InputEvent('input'))
    expect(elemB.value).toEqual(vm.$data['b'].toString())
})

test('Test Parser (Event Listener)', () => {
    document.body.innerHTML = `
    <div id="app">
        <div>{{ num }}</div>
        <button @click="incr" id="test-parser-ev-listener-1">Button</button>
        <button @click="alert(str)" id="test-parser-ev-listener-2"></button>
    </div>
    `
    const vm = new MVVM({
        el: '#app',
        data: {
            num: 1,
            str: "Hello, world"
        },
        methods: {
            incr() {
                this.num += 1
            },
            alert(value: string) {
                console.assert(value === 'Hello, world')
            }
        }
    })

    // 无参数函数调用
    const btn1 = document.getElementById('test-parser-ev-listener-1')! as HTMLButtonElement
    expect(vm.$data['num']).toBe(1)
    btn1.click()
    expect(vm.$data['num']).toBe(2)

    // 有参数函数调用
    const btn2 = document.getElementById('test-parser-ev-listener-2')! as HTMLButtonElement
    btn2.click()
})
