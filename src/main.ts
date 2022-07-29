import MVVM from "./MVVM";
import './style.css'

new MVVM({
    el: '#app',
    data: {
        num: 0,
        input: 'Hello, world!',
        select: ['Rust', 'Python', 'TypeScript', 'JavaScript'],
        selected: -1,
        title: 'Mini MVVM Framework Demo',
    },
    methods: {
        incr() {
            this.num++
        }
    }
})
