<template>
    <div>
        <el-button class="add-img-btn"
            type="primary"
            @click="showModel()">{{this.btnText}}</el-button>
        <el-dialog :visible.sync="model.showModel"
            title="添加图片"
            class="clearfix-dialog"
            width="900px">
            <div class="left-cropper-wrapper">
                <vueCropper autoCrop
                    canScale
                    class="cropper-wrapper"
                    :autoCropWidth="model.webOptions.height"
                    :autoCropHeight="model.webOptions.width"
                    :ref="`cropper_${tabIndex}_${itemIndex}`"
                    :fixedBox="model.webOptions.fixedBox===false?false:true"
                    :img="model.img"
                    :outputSize="1"
                    :outputType="model.webOptions.outputType"
                    @realTime="data=>{realTime(data,tabIndex,itemIndex)}">
                </vueCropper>
            </div>
            <div class="right-btns-wrapper">
                <el-button circle
                    type="primary"
                    size="small"
                    icon="el-icon-plus"
                    title="放大"
                    @click="handleBtnTools('scaleUp',tabIndex,itemIndex)"></el-button>
                <el-button type="primary"
                    size="small"
                    circle
                    icon="el-icon-minus"
                    title="缩小"
                    @click="handleBtnTools('scaleDown',tabIndex,itemIndex)"></el-button>
                <el-button type="primary"
                    size="small"
                    circle
                    title="顺时针旋转"
                    @click="handleBtnTools('rotate90',tabIndex,itemIndex)"> ↻ </el-button>
                <el-button type="primary"
                    size="small"
                    circle
                    title="逆时针旋转"
                    @click="handleBtnTools('rotate-90',tabIndex,itemIndex)"> ↺ </el-button>
                <div class="choose-img">
                    <label :for="`uploader__${tabIndex}_${itemIndex}`"
                        class="el-button el-button--primary el-button--small tool-btns">选择图片</label>
                    <input type="file"
                        :id="`uploader__${tabIndex}_${itemIndex}`"
                        class="hidden-input"
                        @change="uploadImg($event,tabIndex,itemIndex)" />
                    <el-button type="primary"
                        class="tool-btns"
                        size="small"
                        @click="previewCropperImg(tabIndex,itemIndex)">预览</el-button>
                    <el-button type="primary"
                        class="tool-btns"
                        size="small"
                        @click="uploadCropperImg(tabIndex,itemIndex)">上传</el-button>
                </div>
                <div class="preview-box"
                    v-show="model.showPreview"
                    :style="{'width': model.w + 'px', 'height': model.h + 'px',  'margin': '5px'}">
                    <img :src="model.previewUrl">
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { VueCropper } from "vue-cropper";
    export default {
        props: ["configs", "model", "tabIndex", "itemIndex", "curOemName"],
        data() {
            return {
                submitUrl: "api/OEM/uploadImg",
                isUploading: false
            }
        },
        computed: {
            btnText() {
                return this.model.img ? "查看图片" : "+ 添加图片";
            }
        },
        methods: {
            showModel() {
                this.$set(this.model, "showModel", true);
                //如果没有初始化过，则通过$set来初始化一次
                typeof this.model.img === "undefined" && this.$set(this.model, "img", "");
            },
            realTime(previews, tabIndex, itemIndex) {
                const item = this.configs[tabIndex].pageRules[itemIndex];

                this.$refs[`cropper_${tabIndex}_${itemIndex}`]
                    .getCropData(imgData => {
                        this.$set(item, "previewUrl", imgData);
                        this.$set(item, "w", previews.w);
                        this.$set(item, "h", previews.h);
                    });
            },
            previewCropperImg(tabIndex, itemIndex) {
                let item = this.configs[tabIndex].pageRules[itemIndex];

                typeof item.showPreview == "undefined" && this.$set(item, "showPreview", false);
                item.showPreview = !item.showPreview
            },
            uploadCropperImg(tabIndex, itemIndex) {
                let formData = new FormData();

                !this.isUploading && this.$refs[`cropper_${tabIndex}_${itemIndex}`]
                    .getCropBlob(data => {
                        formData.append("img", data);
                        formData.append("tabIndex", tabIndex);
                        formData.append("itemIndex", itemIndex);
                        formData.append("curOemName", this.curOemName);
                        this.isUploading = true;
                        this.$http
                            .post(`${this.submitUrl}`, formData)
                            .then(res => {
                                this.notify(res.data);
                                this.isUploading = false;
                            });
                    });
            },
            handleBtnTools(actionType, tabIndex, itemIndex) {
                if (!this.model.img) return;
                let currentCropper = this.$refs[`cropper_${tabIndex}_${itemIndex}`];
                switch (actionType) {
                    case "scaleUp": //放大
                        {
                            currentCropper.changeScale(1);
                        }
                        break;
                    case "scaleDown": //缩小
                        {
                            currentCropper.changeScale(-1);
                        }
                        break;
                    case "rotate90":
                        {
                            currentCropper.rotateRight(-1);
                        }
                        break;
                    case "rotate-90":
                        {
                            currentCropper.rotateLeft(-1);
                        }
                        break;
                }
            },
            uploadImg(e, tabIndex, itemIndex) {
                if (e.target.value == "") {
                    return false;
                }

                if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
                    this.$notify.error('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
                    return false
                }

                let file = e.target.files[0],
                    fileReader = new FileReader(),
                    item = this.configs[tabIndex].pageRules[itemIndex];

                fileReader.onload = e => {
                    let data;
                    if (typeof e.target.result === 'object') {
                        // 把Array Buffer转化为blob 如果是base64不需要 
                        data = window.URL.createObjectURL(new Blob([e.target.result]))
                    } else {
                        data = e.target.result
                    }
                    item.img = data;
                }

                fileReader.readAsArrayBuffer(file);
            }
        }
    }
</script>

<style lang="scss">
</style>