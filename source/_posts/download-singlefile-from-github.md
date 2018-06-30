---
title: 如何从Github上下载单个文件（适用于Mac与linux用户）
date: 2018-06-30 21:11:28
tags: [MacOs,Github]
---
## 举例，从Github上下载git的源码中的一个自动完成git命令的bash命令文件 git/contrib/completion/git-completion.bash
首先需要打开文件的原始页面，这个很容易，点击右上角的Raw按钮即可
接下来就会跳转到一个新页面地址如下，由于我的本地git版本是2.14.3，所以我查看此命令时也选择tag v2.14.3的标签去打开
    https://raw.githubusercontent.com/git/git/v2.14.3/contrib/completion/git-completion.bash

然后打开终端，输入如下命令，即可下载到本地
```sh
wjjmac:~ zongzijie$ curl 'https://raw.githubusercontent.com/git/git/v2.14.3/contrib/completion/git-completion.bash' >> .git-completion.bash
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 70930  100 70930    0     0  17501      0  0:00:04  0:00:04 --:--:-- 17504
```
可以看到，已经将命令下载到本地了，现在只需要输入命令的前几个字母，马上就能自动提示了
```sh
wjjmac:~ zongzijie$ source .git-completion.bash
wjjmac:~ zongzijie$ git sta
stage    stash    status
```