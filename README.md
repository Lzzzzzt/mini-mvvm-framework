# Mini MVVM Framework
## 简介
这是一个简单的基于`TypeSript`编写的`MVVM`模式的`JavaScript/TypeScript`框架，实现了数据劫持、订阅发布模式、数据单/双向绑定，可以快速的使用事件监听器(`@`语法)
## 快速开始
该框架采用一个简洁的模版语法将数据直接渲染进`DOM`
现在有如下`Html`元素
```html
<body>
<div id="app">
  {{string}}
</div>
<script type="module" src="/src/main.ts"></script>
</body>
```
在程序的入口文件(如`main.ts`)中导入`MVVM`对象，在构造器中传入`Options`对象，即完成一个简单应用的编写。
```typescript
import MVVM from "./MVVM";

new MVVM({
  el: '#app',
  data: {
    string: 'Hello, world!'
  }
})
```
+ `el`是你要编写的应用程序的根元素，一般是直接硬编码在`index.html`文件中，该属性必须存在并且`index.html`存在对应的`DOM`元素，否则框架将无法正常工作
+ `data`中的数据是响应式的，即更改数据，对应的视图会同步更新，`data`中的数据可以是**任意**类型，但是要注意的是，对于对象类型的数据（包括`Array`），需要使用`MVVM`中的`$set`和`$del`对其进行元素的增加和减少的修改
+ 基本的`Html`元素需要在文件中编写
## 如何使用
从一个基本的Demo开始讲解
+ `index.html`
```Html 
<div id="app">  
    <div id="title">{{title}}</div>  
		<select m-model="selected">  
			<option :value="select[0]">{{select[0]}}</option>  
			<option :value="select[1]">{{select[1]}}</option>  
			<option :value="select[2]">{{select[2]}}</option>  
			<option :value="select[3]">{{select[3]}}</option>  
		</select>   
        <div id="num">{{num}}</div>
        <button @click="incr" id="button">INCR</button>  
</div>  
```
+ `main.ts`
```typescript
import MVVM from "./MVVM";  
import './style.css'  
  
new MVVM({  
    el: '#app',  
    data: {  
        num: 0,  
        select: ['Rust', 'Python', 'TypeScript', 'JavaScript'],  
        selected: 'Rust',  
        title: 'Mini MVVM Framework Demo',  
    },  
    methods: {  
        incr() {  
            this.num++  
        }  
    }  
})
```
从上往下看
+ `<div id="app"> ··· </div>`
  + 是应用程序的根元素，后期生成的所有元素都是该元素的子节点
+ `<div id="title" ··· >{{title}}</div>`
  + 使用了双大括号模版语法(Mustache)，效果是将`MVVM`中`data`中的`title`的值转换成字符串然后替换掉`div`中的文本
  + 双大括号模版语法还可以改成`m-text`指令，如`<div id="title" m-text="title" ··· />`效果是一样的
  + 双大括号模版语法只会将`{{···}}`替换成对应文本，其他不会改变
+ `<select m-model="selected"> ··· </select>`
  + `m-model`表示双向绑定指令，即data与其渲染的DOM元素的内容保持一致，`m-model`默认绑定的是`Html`元素的`value`属性，要更改的话，可以在`m-model`后添加冒号和要绑定的属性，或者使用简写语法`%`
```html
<input type="text" m-model:value="input">
或
<input type="text" %value="input">
```
+ `<option :value="select[0]">{{select[0]}}</option>`
  + `:value`是`m-bind`的简写形式，使用方法和`m-model`基本一致
```html
<option m-bind:value="select[0]">{{select[0]}}</option>
或
<option :value="select[0]">{{select[0]}}</option>
```
+ 最后一部分
```html
<div id="num">{{num}}</div>
<button @click="incr" id="button">INCR</button> 
```
+  `@click`是事件监听器语法，表示监听`button`元素的`click`事件，`incr`为`MVVM`对象中`method`属性中的方法，即当`button`元素触发了`click`事件时，调用`incr`函数
+ 可以监听的事件参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
+ 回调函数可以是有参数的也可以时无参数的，有参数的需要使用小括号将参数包裹，就和调用`JavaScript/Typescript`函数一样
```html
<div id="app">
	<button @click="hello(name)" id="button">hello</button>
<div>
<script>
	new MVVM({  
    el: '#app',  
    data: {  
        name: '小明'
    },  
    methods: {  
        hello(n) {
	        alert(n);
        }
    }  
})
</script>
```
