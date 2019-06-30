---
title: 二维码扫描枪中文乱码问题终极解决方案
date: 2019-06-30 21:05:06
tags: 二维码
---

## 问题背景
二维码（内容是，英文字母加数字）扫描时在PC端是需要一个扫描枪来用红外识别的，此扫描枪其实实在模拟键盘输入，相当于就是个键盘。
场景要求：同一个输入框，用户既可以手动录入中文，也能接着就扫描。
问题来了：
1. 输入中文时必然是中文输入法，所以网友说的禁止输入中文的方法行不通。
2. 如果输入了中文，再扫码，必然会出现模拟键盘输入，将二维码中的英文字母和数字合并成中文输出到表单中
3. 扫码枪都没有驱动也没有独立的事件，无法通过事件去区分扫码还是键盘输入，故而无法去做响应。
4. 所以我们的核心目标就是需要模拟一个二维码扫描事件，这个事件能够在触发时告诉我二维码的真实内容，然后就可以拿着这个真实内容去干活了，而不用考虑输入法的干扰。（干活后还能回来将这写中文内容替换成二维码内容，提升用户视觉体验）

预期效果：
1. 用户输入完中文，搜索无果后，马上想到扫码快速解决问题，这是不用清空输入框，也不用切换输入法，直接拿起扫描枪就扫二维码，滴，1秒出结果。
2. 扫描第一张二维码之后，继续扫第二张，第三张.....中途无需清空输入框

解决思路：
1. 确定一个二维码的业务规则，如：是否包含数字，是否包含字母，二维码的固定长度，需要精确到能够识别出来这是否是一个二维码，这个很关键，决定了这个方案的可用性，总不能所有二维码都可以扫。
2. 扫码就是键盘输入，那么一定会触发键盘抬起事件keyup,利用这个事件去记录实际按下的英文按键字符串，形成一个真实的二维码内容
3. 检测键盘按下和抬起的速度，扫码枪的按下和抬起的间隔都在70ms以下，所以可以根据这个时间来粗暴的判断单次按键是扫描枪扫描的还是手动输入的。
4. 当然手动输入也可以低于70ms，但是稳定且持续到二维码全都输入完成，也是很小的机率，即便出现了，还有最后一道防线，二维码规则不对的也不会算作扫码。
5. 根据以上的所有条件即可精确判断出(99%)是否是扫描的二维码，那么也就可以模拟一个二维码扫描的事件出来了。
6. 有了二维码扫描事件，就可以拿着这个响应事件中的二维码内容去干活了。

jquery插件已写好，需要的自取
使用示例：
```js
//监听扫描抢输入
var me=this;
me.$searchInput.startListen({
    show : function(code){
        me.btnSearchEvt(code).then(function(){
            //中文输入法完成后输入到文本框这个中间会有延迟，这里需要延后替换，不然会被输入法覆盖。
            setTimeout(function () {
                //为了保证查询的结果是输入框上的二维码对应的内容，保证最终一致性
                me.$searchInput.val(code);
            }, 500);
        });
        this.clearRealKeys();
    }
});
```
插件代码：
```js
var barcode = {
        functionalKeyArray : [9, 20, 13, 16, 17, 18, 91, 92, 93, 45, 36, 33,32, 34, 35, 37, 39, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 19, 145, 40, 38, 27], //键盘上功能键键值数组
        listenerObj: null,
        letter: false,
        number: true,
        check: true,
        realKeys:"",
        /* 一次按键时间间隔 */
        oneKeyTime: '',
        /* 两次按键时间间隔 */
        twoKeyTime: '',
        /* 键按下的时间    */
        keyDownTime: '',
        /* 条形码长度      */
        barcodeLen: 8,
        /* 一次按键按下到释放的时间间隔 */
        spanTime: 80,
        /* 零的key值      */
        zerokeyVal: 48,
        /* 数字9的key值   */
        ninekeyVal: 57,
        /* a的key值      */
        akeyVal: 65,
        /* z的key值      */
        zkeyVal: 90,
        /**
         * 展示扫描结果
         * @return {[type]} [description]
         */
        show: function() {},
        /**
         * 校验手动输入
         * @return {[type]} [description]
         */
        checkHandInput: function() {
            if (this.oneKeyTime > this.spanTime) {
                return true;
            }
            return false;

        },
        /**
         * 键盘开始按下
         * @return {[type]} [description]
         */
        on_key_down: function() {
            // var that = this;
            // this.listenerObj.keydown(function(e) {
            //    
            // });
        },
        /**
         * 键盘抬起
         * @return {[type]} [description]
         */
        on_key_up: function() {
            var that = this;
            this.listenerObj.keyup(function(e) {
                //不管如何,记录按键,最终以记录的按键为准.
                that.recordKeys(e);
                //过滤掉二维码里面的回车,统一由扫描插件回调后代码统一处理后续业务.避免重复触发(回车后触发业务很常见,所以扫描枪自带回车,二维码自带的回车都要屏蔽掉)
                if(e.keyCode===13){
                    return false;
                }
                var d = new Date();
                var keyUpTime = d.getTime();

                that.oneKeyTime = parseInt(keyUpTime) - parseInt(that.keyDownTime);

                var isHand = that.checkHandInput();
                
                //是手动输入则不做默认处理，但是要清空按键记录，避免用户先手动按键，再扫描二维码的场景下，将两个按键记录拼接后导致查询不出来结果。
                if (that.check && isHand && that.in_range(e.which)) {
                    that.clearRealKeys();
                } else if (that.check && !isHand && that.check_barcode()) {
                    //说明是非手动输入，则直接将记录的按键填充到输入框中，无视客户端的输入法。
                    that.createListEl();
                }
            });
        },
        /**
         * 键盘已经按下
         * @return {[type]} [description]
         */
        on_key_press: function() {
            //var that = this;
            // this.listenerObj.keypress(function(e) {
            //     if (e.which == 13 && that.check_barcode()) {
            //         that.createListEl();
            //     }
            // });
        },
        
        /**
         * 记录按键
         * @param e
         */
        recordKeys:function(e){
            var that=this;
            var d = new Date();
            var curTime = parseInt(d.getTime());
            if (that.keyDownTime !== '' && _.isNaN(that.keyDownTime)==false) {
                that.twoKeyTime = curTime - that.keyDownTime;
            }
            that.keyDownTime = curTime;

            //过滤掉功能按键，包括空格和换行
            if(that.functionalKeyArray.some(function(k){return k===e.keyCode})){
                return;
            }

            //如果是中文输入法，则需要记录真实按键
            if(e.keyCode===229){
                //e.originalEvent.code 有可能未定义，此时尝试获取key
                if(!e.originalEvent)return;
                var code=e.originalEvent.code||e.originalEvent.key||"";
                var key=code.replace("Key","").replace("Digit","").replace("NumPad","");
                var realkey=that.keyMap[key];
                key=realkey===undefined?key:realkey;
                that.realKeys+=key;
                console.log(that.realKeys);
                return
            }
            //按下退格键，清空按键记录
            if(e.keyCode===8){
                that.clearRealKeys();
                return;
            }
            that.realKeys= that.realKeys+e.key;
            console.log(that.realKeys)
        },
        /**
         * 校验条码结果是否满足条件
         * @return {[type]} [description]
         */
        check_barcode: function() {
            var code = this.realKeys;

            if (code.length !== this.barcodeLen) {
                //$(this.listenerObj).val("").focus();
                return false;
                // layer.msg('条形码不合法',{time : 800});
            }
            return true;

        },
        /**
         * 判断按下的键是否在字母加数字这个范围
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        in_range: function(key) {

            var isLegal = false;
            if (this.number) {
                isLegal = this.is_number(key);
            }
            if (this.letter) {
                isLegal = this.is_letter(key);
            }
            if (this.number && this.letter) {
                isLegal = this.is_number || this.is_letter ? true : false;
            }
            return isLegal;
        },
        /**
         * 按钮是否是数字
         * @param  {[type]}  key [description]
         * @return {Boolean}     [description]
         */
        is_number: function(key) {
            if (key > this.ninekeyVal || key < this.zerokeyVal) {
                return false;
            }
            return true;

        },
        /**
         * 按钮是否是字母
         * @param  {[type]}  key [description]
         * @return {Boolean}     [description]
         */
        is_letter: function(key) {
            if (key > this.zkeyVal || key < this.akeyVal) {
                return false;
            }
            return true;
        },
        /**
         * 校验是否联网
         * @return {[type]} [description]
         */
        check_network: function() {
            //return navigator.onLine ? true : false;
        },
        /**
         * 创建扫描结果
         * @return {[type]} [description]
         */
        createListEl: function() {
            if (typeof this.show == 'function') {
                this.show(this.realKeys);
                // layer.msg('扫描成功',{time:1000});
            } else {
                //layer.msg('no callback function');
            }
            //this.listenerObj.val("").focus();
        },
        /**
         * 清空按键记录
         * @return {[type]} [description]
         */
        clearRealKeys: function() {
            this.realKeys="";
            //console.log("clearRealKeys.")
        },
        /**
         * 保持激活输入框
         * @return {[type]} [description]
         */
        keepFocusInput: function() {
            this.listenerObj.blur(function() {
                var that = $(this);
                setTimeout(function() {
                    that.focus().select();
                }, 100);
            });
        },
        /**
         * 开始监听
         * @param  {[type]} listenerObj [description]
         * @param  {[type]} settings    [description]
         * @return {[type]}             [description]
         */
        startListen: function(listenerObj, settings) {
            for (var member in settings) {
                if (typeof barcode[member] !== 'undefined') {
                    barcode[member] = settings[member];
                }
            }
            barcode.listenerObj = listenerObj;

            this.on_key_down();
            this.on_key_up();
            this.on_key_press();
            //this.keepFocusInput();
            this.listenerObj.focus().select();
        }

    };
    $.fn.startListen = function(options) {
        var settings = $.extend({
            barcodeLen :76,
            letter : true,//允许有字母
            number : true,//允许有数字
            check  : true
        }, options);
        //设置微软自带中文输入法下的key为标准key
        barcode.keyMap=$.extend({
            "Comma":",",//微软输入法逗号关键字替换
            "Minus":"-",//微软输入法关键字替换
            "Enter":"",//微软输入法关键字忽略
            "ShiftLeft":"",//微软输入法关键字忽略
            "ArrowDown":"",//windows搜狗中文输入法忽略
            "Space":""//windows搜狗中文输入法忽略
        }, options.keyMap);
        barcode.startListen(this, settings);
    }
```
