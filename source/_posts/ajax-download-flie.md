---
title: XMLHttpRequest异步下载文件
date: 2019-07-12 00:17:20
tags: [异步,下载,XMLHttpRequest]
---

```js
/**
 * 导出Excel
 */
excel: function (params) {
    var url = '/ureport2demo/report/excel';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);        // 也可以使用POST方式，根据接口
    xhr.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhr.responseType = "blob";    // 返回类型blob
    // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
    xhr.onload = function () {
        // 请求完成
        if (this.status === 200) {
            // 返回200
            var blob = this.response;
            var reader = new FileReader();
            reader.readAsDataURL(blob);    // 转换为base64，可以直接放入a表情href
            reader.onload = function (e) {
                // 转换完成，创建一个a标签用于下载
                var a = document.createElement('a');
                a.download = params.file+'.xlsx';
                a.href = e.target.result;
                $("body").append(a);    // 修复firefox中无法触发click
                a.click();
                $(a).remove();
            }
        }
    };
    // 发送ajax请求
    xhr.send(JSON.stringify(params))
}
```