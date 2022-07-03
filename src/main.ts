import MVVM from "./MVVM";


const vm = new MVVM({
    el: '#app',
    data: {
        msg: true,
        obj: {
            t: 't'
        },
        checked: true
    },
    methods: {
        hello() {
            console.log('hello, world')
        }
    }
})

console.log('ready')

Object.defineProperty(window, 'MVVM', {
    value: vm
})
