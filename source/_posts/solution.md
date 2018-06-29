---
title: Git错误解决方案
date: 2018-06-30 00:03:58
tags: Git
---
### 问题：
Rename from 'D:/Git/slxt/.git/index.lock' to 'D:/Git/slxt/.git/index' failed. Should I try again? (y/n)

### 解决办法
rm -rf .git/index --清除暂存
git reset --mixed head --强制恢复到工作区域状态