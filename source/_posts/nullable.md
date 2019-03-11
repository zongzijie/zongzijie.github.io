---
title: 深入理解C#可空类型Nullable<T>
date: 2018-11-23 13:35:55
tags: ['Nulable<T>',可空类型]
---
花时间研究了下C#的源码，发现了点一起不清晰的东西，分享出来
# 问题1：int? i =null;为什么可以把null赋值给值类型
## 首先，并不存在可为空的值类型
可为空的值类型
Nullable<T>只是在逻辑层面上实现了把null赋值给值类型，给人一种值类型可为null的感觉。
Nullable<T> 是一个结构体，内部有两个成员，public bool HasValue 和 private innerValue

int? i =null;
代码做了1件事
1.判断赋值为null时直接返回new Nullable<int>();

CLR在对Nullable<T>实例执行装箱操作时首先检查它是否为null，若为null则CLR不装箱任何东西而是直接返回null；若实例的值不是null则获取该实例的值（Value属性）并对这个值进行装箱操作
# 问题2: int? i = 3;  i.GetType();//为什么返回 int32
Nullable<T> 并没有重写GetType方法，所以在调用GetType之前会先装箱到Object
相当于 int? i=3; object a=i; a.GetType();
所以是Int32
