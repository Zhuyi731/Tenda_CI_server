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
                    :autoCropWidth="model.webOptions.width"
                    :autoCropHeight="model.webOptions.height"
                    :ref="`cropper_${tabIndex}_${itemIndex}`"
                    :fixedBox="model.webOptions.fixedBox===false?false:true"
                    :img="model.img"
                    :outputSize="1"
                    :outputType="model.webOptions.outputType?model.webOptions.outputType:'png'"
                    :mode="model.webOptions.mode?model.webOptions.mode:'contain'"
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
                <div class="img-tip">
                    {{model.webOptions.imgTip}}
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
                !this.isUploading && this.$refs[`cropper_${tabIndex}_${itemIndex}`]
                    .getCropBlob(data => {
                        let formData = new FormData();
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
                            })
                            .catch(err => {
                                this.$notify.error(err.message);
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
                let file = e.target.files[0],
                    fileReader = new FileReader(),
                    item = this.configs[tabIndex].pageRules[itemIndex];

                if (e.target.value == "") {
                    return false;
                }

                let maxLimitSize = (item.webOptions.limitSize && item.webOptions.limitSize < 2 * 1024 * 1024) ? item.webOptions.limitSize : 2 * 1024 * 1024;
                if (e.target.files[0] && e.target.files[0].size > maxLimitSize) {
                    this.$notify.error(`${item.webOptions.title}图片大小不能超过${maxLimitSize/1024}KB`);
                    return false;
                }

                if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
                    this.$notify.error('${item.webOptions.title}图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
                    return false
                }

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
    .img-tip {
        display: inline-block;
        width: 130px;
        overflow: visible;
        word-break: break-word;
        font-size: 12px;
        color: #909399;
        line-height: 12px;
    }

    .add-img-btn {
        width: 100%;
    }

    .clearfix-dialog {
        .el-dialog__body::after {
            display: block;
            content: "";
            height: 0;
            clear: both;
            visibility: hidden;
            zoom: 1;
        }
    }

    .left-cropper-wrapper {
        width: 700px;
        height: 550px;
        margin-left: 20px;
        float: left;

        .cropper-wrapper {
            width: 700px !important;
            height: 550px !important;
            display: block;
        }
    }

    .right-btns-wrapper {
        position: relative;
        float: left;
        width: 80px;
        height: 550px;
        padding: 0 20px;

        .hidden-input {
            display: none;
        }

        button {
            display: block;
            height: 32px;
            width: 32px;
            margin: 0 !important;
            margin-bottom: 20px !important;
        }

        .choose-img {
            width: 80px;
        }

        .tool-btns {
            width: 80px !important;
            margin: 0;
            margin-bottom: 20px !important;
        }

        .preview-box {
            position: absolute;
            background: #FFF;
            border: 1px solid #DCDFE6;
            border-radius: 4px;
            padding: 20px;
            left: 120px;
            top: 280px;
            transform: translateY(-50%);
            z-index: 9999;
        }

        .preview-box::before {
            display: block;
            width: 0;
            height: 0;
            z-index: 8888;
            border: 10px solid transparent;
            border-right: 10px solid #DCDFE6;
            position: absolute;
            left: -21px;
            top: 50%;
            transform: translateY(-50%);
            content: " "
        }

        .preview-box::after {
            display: block;
            width: 0;
            height: 0;
            z-index: 99999;
            border: 10px solid transparent;
            border-right: 10px solid #FFF;
            position: absolute;
            left: -20px;
            top: 50%;
            transform: translateY(-50%);
            content: " "
        }
    }
</style>