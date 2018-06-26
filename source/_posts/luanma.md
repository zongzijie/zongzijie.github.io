---
title: git status 中文路径乱码问题解决方案
date: 2018-06-26 18:47:16
tags: git
---
问题
```sh
$ git status
```
![](/images/luanma/before.jpeg)
直接上代码
```sh
$ git config –-global core.quotepath false
```
![](/images/luanma/after.jpeg)
over