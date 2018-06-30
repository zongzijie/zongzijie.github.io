---
title: Git 如何管理本地分支-删除多余分支
date: 2018-06-30 21:59:43
tags: Git
---
### 查找已经合并过的分支，也就是当前分支的直接上游分支，这些分支的特性通常都已经合并到当前分支了，推荐删除
```sh
$ git branch --merged
* master
  branch1 //直接上游分支，可以删除
```
与其相反的分支，就是没有合并过的分支，如果删除这些分支，则会抛出错误，阻止危险操作
```sh
$ git branch --no-merged
  branch2 //还没有与当前分支合并，不能删除
$ git branch -d branch2
error: The branch 'testing' is not fully merged.
If you are sure you want to delete it, run 'git branch -D testing'.
```
当然，你可以强制删除，用大写的D即可 -D
```sh
$ git branch --no-merged
  branch2 //还没有与当前分支合并，不能删除
$ git branch -D branch2
```

参考文献：http://iissnan.com/progit/html/zh/ch3_3.html
