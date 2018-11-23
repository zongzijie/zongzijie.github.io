---
title: Promise 本质上是一个有限状态机
date: 2018-09-05 18:42:41
tags: [promise,本质]
---
[状态机是什么？](https://zh.wikipedia.org/zh-hans/%E6%9C%89%E9%99%90%E7%8A%B6%E6%80%81%E6%9C%BA)
![](/images/promise/finite-state-machine.png)
# promise本质上是一个有限状态机，将下列代码粘贴到任何一个支持ES6的浏览器下都可以正常使用，与本来的promise使用方法没有区别,下面是具体的代码。代码很短，但能完整诠释Promise原理。
```javascript
//promise的本质就是一个有限状态机
class Promise2 {
  constructor(fn) {
    let me=this;
    me.__queue = [];
    me.__status='';
    me.__success_res=null;
    me.__error_res=null;
    fn&&fn(value=>{me.resolve(value)}, reason=>{me.reject(reason)});
  }
  resolve(...args){
    this.__status = 'success';
    this.__success_res = args;
    this.__queue.forEach(json=>{
      json.resolve(...args);
    });
  }
  reject(...args){
    this.__status = 'error';
    this.__success_res = args;
    this.__queue.forEach(json=>{
      json.reject(...args);
    });
  }
  then(resolve, reject) {
    if (this.__status == 'success') {
      resolve(...this.__success_res);
    } else if (this.__status == "error") {
      reject(...this.__error_res);
    } else {
      this.__queue.push({
        resolve,
        reject
      });
    }
  }

}
Promise2.all=function(args){
  let res=[];
  let p=  new Promise2();
  let i=0;
  next();
  function next(){
    let me=this;
    args[i].then(function(re){
      res.push(re);
      i++;
      if (i==args.length) {
        p.resolve(res);
      }else{
        next();
      }
    },p.reject);
  }
  return p;
}

//test1
let p=new Promise2(function(resolve,reject){
  setTimeout(function(){
    resolve(12);
  },500);
});
p.then(function(params){
  alert(params);
},function(params){
    alert("失败");
});

//test2
let p1=new Promise2();
setTimeout(function(){
  p1.resolve(13);
},500);
p1.then(num=>{
  alert(num);
});

//test3
let p2=new Promise2();
setTimeout(function(){
  p2.resolve(12);
},500);
let p3=new Promise2();
setTimeout(function(){
  p3.resolve(13);
},500);
Promise2.all([p2,p3]).then(function(args){
  alert(args[0]+args[1]);
});
```
