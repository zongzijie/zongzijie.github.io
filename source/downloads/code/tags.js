Vue.component("tags", {
    props: ["tags", "tagTypeCode", "tagType"],
    template: `
    <div class="tags-container" >
		<transition-group name="fade" tag="p" mode="in-out">
			<template v-if="tags.length>0">
		        <template v-for="(tag,index) in tags">
		            <div class="tags-item" :key="index">
		            	<div class="tag-mask" :index="index"  @click.stop.self="showTagForm(2,tag,$event)"></div>
		                <div class="tag-text" >{{tag.level1+"/"+tag.level2+"/"+tag.custom}}</div>
		                <i class="tag-x" :index="index" @click.stop="removeTag" ></i>
		            </div>
		        </template>
		        <i class="btn-add " key="btn-add" @click.stop.self="showTagForm(1,null,$event)"> 
		        </i>
		    </template>
		    <template v-else>
		 		<div class="tags-item" key=0>
		            <div class="tag-mask" index=-1 @click.stop.self="showTagForm(1,$event)" ></div>
		            <i class="tag-add"></i>
		            <div class="tag-text" >添加标签</div>
		        </div>
		    </template>
		    <div class="tag-form" key="tag-form">
		    	<form @submit.prevent>
		    		<input type="text" name="level1" >
		    		<input type="text" name="level2" >
		    		<input type="text" name="custom" @keyup.enter="addTag">
		    		<input type="hidden" name="tagIndex" >
		    		<input type="button" name="create" @click="addTag" value="创建标签">
		    		<input type="button" name="modify" @click="editTag" value="修改标签">
		    	</form>
		    </div>
		</transition-group>
    </div>`,
    created: function() {
        $(document).bind("click", function(e) {
            var target = $(e.target);
            if (target.closest(".tag-form").length == 0) {
                $(".tag-form").fadeOut(500);
            }
        });
    },
    methods: {
        showTagForm: function(mode, tag, event) {
            console.log(event);
            var $tag = $(event.target);
            var left = $tag.offset().left;
            var top = $tag.offset().top + $tag.height() + 2;
            var $tagForm = $(".tag-form");
            $tagForm.css({
                left: left,
                top: top
            });
            $tagForm.fadeIn(500);
            if (mode == 2) {
                $tagForm.find("input[name='tagIndex']").val($tag.attr("index"));
                $tagForm.find("input[name='level1']").val(tag.level1);
                $tagForm.find("input[name='level2']").val(tag.level2);
                $tagForm.find("input[name='custom']").val(tag.custom);
            	$tagForm.find("input[name='create']").hide();
            	$tagForm.find("input[name='modify']").show();
            }
            if(mode==1){
            	$tagForm.find("input[name='create']").show();
            	$tagForm.find("input[name='modify']").hide();
            }
        },
        addTag: function(event) {
            var $tagForm = $(".tag-form");
            var level1 = $tagForm.find("input[name='level1']").val();
            var level2 = $tagForm.find("input[name='level2']").val();
            var custom = $tagForm.find("input[name='custom']").val();
            if (level1 || level2 || custom) {
                this.tags.push({
                    level1: level1,
                    level2: level2,
                    custom: custom
                });
            } else {
                this.tags.push({ level1: "无" + this.tagType });
            }
            //清空输入框
            $tagForm.find("input[name='level1']").val('');
            $tagForm.find("input[name='level2']").val('');
            $tagForm.find("input[name='custom']").val('');
        },
        editTag: function(event) {
            var $tagForm = $(".tag-form");
            var tagIndex = parseInt($tagForm.find("input[name='tagIndex']").val());
            var level1 = $tagForm.find("input[name='level1']").val();
            var level2 = $tagForm.find("input[name='level2']").val();
            var custom = $tagForm.find("input[name='custom']").val();
            if (level1 || level2 || custom) {
                this.tags.splice(tagIndex, 1, {
                    level1: level1,
                    level2: level2,
                    custom: custom
                });
            } else {
                this.tags.splice(tagIndex, 1, { level1: "无" + this.tagType });
            }
            //关闭表单
            $(".tag-form").fadeOut(500);
        },
        removeTag: function(event) {
            var $x = $(event.target);
            this.tags.splice($x.attr("index"), 1);
        }
    }
});

//使用
var vm = new Vue({
    el: ".component-demo",
    data: {
        tags: [{
            level1: "tag1",
            level2: "tag2",
            custom: "华师附属幼儿园"
        }, {
            level1: "tag3",
            level2: "tag4",
            custom: "北大附属幼儿园"
        }],
        tagTypeCode: 'youeryuan',
        tagType: '幼儿园'
    }
});