---
title: 短信消息编辑器
date: 2019-07-07 23:38:16
tags: js
---
最近工作中需要实现一个预编辑短信的编辑器
可以输入
可以添加字段
可以删除字段
最终可以生成一个短信消息模板字符串
如图：
![](/images/msgeditor/msg-editor.png)
[演示地址](/downloads/code/index.html)

实现源码：

```html
<!DOCTYPE html>
<html>

<head>
    <title>短信编辑器</title>
    <style type="text/css">
    .edit-content {
        word-wrap: break-word;
        /*遇到空格整个单词显示不完就自动换行到下一行*/
        word-break: break-all;
        /*如果一行没有空格就到头截断单词换行*/
        outline: none;
        padding: 0 10px;
        display: block;
        height: 90px;
        overflow-y: auto;
        border: solid 1px #ddd;
        margin: 6px 0 6px 0;
    }

    .edit-content span[contenteditable="false"] {
        box-sizing: border-box;
        height: 22px;
        line-height: 16px;
        margin: 2px 0 2px 6px;
        border: none;
        padding: 3px 3px 3px 6px;
        border-radius: 2px;
        background-color: #eee;
        /*position: relative;*/
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        -ms-text-overflow: ellipsis;
        white-space: nowrap;
    }

    .edit-content i {
        margin-left: 5px;
        margin-right: 5px;
        color: #898989;
        cursor: pointer;
    }

    .edit-content i:hover {
        color: #333;
    }

    .edit-content .item {
        border: solid 1px #d8d8d8;
        background: #e4e4e4;
        padding: 0px 0px 0px 5px;
        line-height: 30px;
        min-height: 30px;
        float: left;
        margin-bottom: 5px;
        margin-right: 5px;
        cursor: default;
    }

    .edit-content .item:hover {
        background: #def0ff;
        border-color: #aad8ff;
    }

    .edit-content .item.active {
        background: #0066cc;
        border-color: #0066cc;
        color: #fff;
    }

    .edit-content .item cite {
        font-style: normal;
        font-size: 18px;
        float: right;
        line-height: 18px;
        text-align: center;
        width: 18px;
        height: 18px;
        cursor: pointer;
        margin: 5px 5px 0px 5px;
    }

    .edit-content .item cite:hover {
        background: #0066cc;
        color: #fff;
    }
    </style>
    <script src='http://code.jquery.com/jquery-latest.js'></script>
</head>

<body>
    <button class='addField'>add
    </button>
    <button class='getMessage'>getmessage
    </button>
    <div contenteditable="true" class="edit-content">
    </div>

    <div  class="msg">
    </div>
</body>
<script type="text/javascript">
$(function() {
    var msgeditor = {
        /**
         * 字段列表
         * @type {Array}
         */
        fields: [
            { text: "房间简称", value: "ShortRoomInfo" },
            { text: "款项名称", value: "ItemName" },
            { text: "余额", value: "RmbYe" },
            { text: "逾期天数", value: "OverDay" },
        ],
        /**
         * 初始化
         * @return {[type]} [description]
         */
        init: function() {
            this.reminderContent = $(".edit-content")
            this.btnAddField = $(".addField")
            this.getMessage = $(".getMessage")
            this.setContent("【欠款提醒】{ShortRoomInfo}，{ItemName}  {RmbYe}元，逾期{OverDay}天。");
            this.ieFix() //修复IE下兼容性问题
            this.bindEvent()
        },
        /**
         * 获取一个随机整数
         * @param  {[type]} max [description]
         * @return {[type]}     [description]
         */
        getRandomInt: function(max) {
            return Math.floor(Math.random() * Math.floor(max));
        },
        /**
         * 绑定事件
         */
        bindEvent: function() {
            var me = this;
            //绑定内容区域的按键事件
            me.reminderContent.on("click", "i", function(e) { //删除按钮事件
                this.parentNode.remove()
            })
            //添加
            me.btnAddField.on("click", function(e) { 
                me.addFieldToContent(me.fields[me.getRandomInt(me.fields.length)])
            })
            //获取消息
            me.getMessage.on("click", function(e) { 
               $(".msg").html(me.getContent()) 
            })
        },
        /**
         * 判断是否是ie浏览器
         */
        isIE: function() {
            if (!!window.ActiveXObject || "ActiveXObject" in window)
                return true;
            else
                return false;
        },
        /**
         * 修复contenteditable的Ie兼容性问题
         */
        ieFix: function() {
            if (this.isIE() === false) return;
            $(document).on("keydown", function(e) {
                var selection = window.getSelection()
                //不可编辑元素内禁用键盘
                if (selection && selection.focusNode) {
                    var contentEditable = selection.focusNode.contentEditable || selection.focusNode.parentNode.contentEditable;
                    if (contentEditable == "false" && e.keyCode != 8) {
                        return false;
                    }
                }

                //如果此时按下了退格键，且前一个元素是无法编辑的元素（通常是x按钮），则直接整个删除（触发删除事件）
                //如果当前元素的前一个元素是无法编辑的元素，或者父元素是无法编辑的元素，都要直接删除
                //策略：首先尝试触发click，然后触发删除。
                if (e.keyCode == 8) {
                    $(selection.focusNode.parentNode.contentEditable == "false" && selection.focusNode.parentNode).click();
                    $(selection.focusNode.contentEditable == "false" && selection.focusNode).click();
                    $(selection.focusNode.parentNode.contentEditable == "false" && selection.focusNode.parentNode).remove();
                    $(selection.focusNode.previousSibling && selection.focusNode.previousSibling.contentEditable == "false" && selection.anchorOffset == 0 && selection.focusNode.previousSibling).remove();
                } else if (e.keyCode == 46) {
                    return false; //不允许使用del按键
                }
            })
        },
        /**
         * 获取消息内容
         * @returns {*}
         */
        getContent: function() {
            var me = this;
            var msg = me.reminderContent.text();
            me.fields.forEach(function(field) {
                var reg = new RegExp(field.text + "x", "g");
                msg = msg.replace(reg, "{" + field.value + "}");
            })
            return msg;
        },
        /**
         * 设置消息内容
         * @param msg
         */
        setContent: function(msg) {
            var me = this;
            var msgresult = msg;
            //var msgresult = "<span class='editor-text'>【应收款】<br></span>{ShortRoomInfo}<span class='editor-text'><br></span>{ItemName}<span class='editor-text'>逾期已达<br></span>{OverDay}<span class='editor-text'>，请关注！<br></span>{RmbYe}<span class='editor-text'><br></span>";
            me.fields.forEach(function(field) {
                var reg = new RegExp("{" + field.value + "}", "g");
                msgresult = msgresult.replace(reg,
                    "<span contenteditable='false'>" + field.text + "<i contenteditable='false'>x</i></span>");
            });
            me.reminderContent.html(msgresult);
        },
        /**
         * 向消息内容中添加字段
         * @param field
         */
        addFieldToContent: function(field) {
            var me = this;
            var html = " <span contenteditable='false'>" + field.text + "<i contenteditable='false'>x</i></span> ";
            me.reminderContent.append(html);
        },
    }

    $(document).ready(function() {
        msgeditor.init();
    })
})
</script>

</html>
```