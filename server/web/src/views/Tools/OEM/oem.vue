<template>
    <div class="new-oem">
        <div class="baseline-left">
            <div class="baseline ">
                <el-form ref="form1"
                    label-width="80px">
                    <el-form-item label="主线">
                        <el-select v-model="query.baseLine"
                            @change="changeBaseLine">
                            <el-option v-for="(baseline,index) in baseLines"
                                :key="index"
                                :label="baseline"
                                :value="baseline"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="OEM名称">
                        <el-input v-model="query.name"></el-input>
                    </el-form-item>
                    <el-form-item label="svn版本">
                        <el-input v-model="query.version"
                            placeholder="svn版本(为空则使用最新版本)"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="creatOem"
                            class="creat-oem-btn"
                            type="primary">创建OEM</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="baseline baseline-bottom">
                <div class="help-wrap">
                    <el-button type="primary"
                        @click="showDoc">开发文档</el-button>
                    <el-button type="success"
                        @click="addNewLine">添加新主线</el-button>
                </div>
            </div>
        </div>

        <div class="baseline baseline-right">
            <el-container>
                <el-header>
                    <div class="el-form-item">
                        <label class="el-form-item__label">当前项目</label>
                        <div class="el-form-item__content"
                            style="color:#409EFF;font-size:18px;font-weight:bold">{{curOemName}}</div>
                    </div>
                </el-header>
                <el-main>
                    <el-form ref="form2"
                        label-width="180px"
                        :rules="rules"
                        v-loading="configLoading"
                        :element-loading-text="loadingText"
                        show-message
                        status-icon>
                        <el-tabs tab-position="left">
                            <el-tab-pane v-for="(tabs,tabIndex) in configs"
                                :key="tabIndex"
                                :label="tabs.title">
                                <el-form-item v-for="(item,itemIndex) in tabs.pageRules"
                                    :key="itemIndex"
                                    :label="item.webOptions.title"
                                    :prop="tabIndex + '_' + itemIndex">
                                    <el-col :span="18"
                                        v-if="item.webOptions.type === 'select'">
                                        <el-select v-model="item.value"
                                            :multiple="!!item.webOptions.multiple"
                                            :placeholder="item.webOptions.placeholder">
                                            <el-option v-for="(value,key) in item.webOptions.selectArray"
                                                :key="value"
                                                :value="key"
                                                :label="value">
                                            </el-option>
                                        </el-select>
                                    </el-col>
                                    <el-col :span="18"
                                        v-else-if="item.webOptions.type === 'colorPicker'">
                                        <el-color-picker v-model="item.value"
                                            :show-alpha="!!item.webOptions['show-alpha']"
                                            :predefine="predefineColors"></el-color-picker>
                                    </el-col>
                                    <el-col :span="18"
                                        v-else-if="item.webOptions.type === 'img'">
                                        <img-uploader :model="item"
                                            :tabIndex="tabIndex"
                                            :itemIndex="itemIndex"
                                            :configs="configs"
                                            :curOemName="curOemName"></img-uploader>
                                    </el-col>
                                    <el-col :span="18"
                                        v-else>
                                        <el-input :placeholder="item.webOptions.placeholder"
                                            v-model="item.value"></el-input>
                                    </el-col>
                                    <el-col :span="2"
                                        class="tips">
                                        <tips :detail="item.webOptions.detail"></tips>
                                    </el-col>
                                    <el-col :span="2">
                                        <el-button circle
                                            v-if="item.webOptions.type !== 'img'"
                                            size="mini"
                                            type="danger"
                                            icon="el-icon-back"
                                            @click="resetToDefault(tabIndex + '_' + itemIndex)"></el-button>
                                    </el-col>
                                </el-form-item>
                            </el-tab-pane>
                        </el-tabs>

                        <el-form-item v-show="hasData">
                            <el-button type="primary"
                                @click="submit">上传配置</el-button>
                            <el-button type="success"
                                @click="preview">预览界面</el-button>
                            <el-button type="danger"
                                @click="download">下载代码</el-button>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
        </div>

    </div>
</template>

<script>
    import tips from "../tips.vue";
    import imgUploader from "./imgUploader.vue";
    import { VueCropper } from "vue-cropper";

    export default {
        components: {
            tips,
            VueCropper,
            imgUploader
        },
        data() {
            return {
                baseLines: {},
                configs: [],
                curOemName: "请选择主线并创建OEM",
                hasData: false,
                configLoading: false,
                query: {
                    baseLine: "",
                    name: "",
                    version: ""
                },
                //预定义颜色，等   
                predefineColors: [
                    "#ed7020", //腾达橙
                    "#f60", //腾达橙二号
                    "#d82228",
                    "#409EFF", //blue
                    "#67C23A", //success
                    "#E6A23C", //warning
                    "#F56C6C", //danger
                    "#909399", //info
                    "#666", //字体
                    "#333",
                    "#000",
                    "#fff",
                    "#303133", //主要文字
                    "#606266", //常规文字
                    "#C0C4CC" //占位文字
                ],
                loadingText: "",
                rules: {}
            }
        },
        methods: {
            changeBaseLine: function(val) {
                this.query.name = `${val}-OEM`;
            },
            creatOem: function() {
                if (!this.query.baseLine) {
                    this.$message.error("请选择主线");
                    return;
                }
                if (!/[^\s]/.test(this.query.name)) {
                    this.$message.error("定制名称不能为空");
                    return;
                }
                this.configLoading = true;
                this.loadingText = "拼命加载配置中";
                this.$http
                    .post(`/api/OEM/creatOem`, this.query)
                    .then(res => {
                        res = res.data;
                        if (res.status == "error") {
                            this.notify(res);
                        } else {
                            this.hasData = true;
                            this.curOemName = this.query.name;
                            this.configLoading = false;
                            this.loadConfig(res.config);
                        }
                    })
                    .catch(console.log);
            },
            loadConfig: function(config) { //加载配置  同时生成校验规则
                const that = this;
                this.configs = config;

                function validator(rule, value, callback) {
                    let tabIndex = rule.field.split("_")[0],
                        itemIndex = rule.field.split("_")[1];
                    //发送给服务器进行验证
                    that.$http
                        .post(`/api/OEM/validate/${that.curOemName}`, {
                            value: that.configs[tabIndex].pageRules[itemIndex].value,
                            field: `${rule.field}`
                        })
                        .then(res => {
                            callback(res.data.message);
                        })
                        .catch(e => {
                            that.$notify({ title: "错误!", message: `POST:/api/OEM/validate/${rule.field} \n 请求时发生错误`, type: "error", offset: 100, duration: 3000 });
                            callback("发送给服务器验证时发生错误");
                        });
                }

                this.configs.forEach((tab, tabIndex) => {
                    tab.pageRules.forEach((item, itemIndex) => {
                        //往对象上绑定新的数据不会是响应式的，需要通过Vue.$set来设置
                        this.$set(item, "value", item.webOptions.defaultValue);

                        //如果配置项需要验证，则配置验证规则
                        if (item.hasValidator) {
                            let trigger;
                            if ((item.webOptions && (item.webOptions.type == "colorPicker" || item.webOptions.type == "select"))) {
                                trigger = "change";
                            } else {
                                trigger = "blur";
                            }
                            this.$set(this.rules, `${tabIndex}_${itemIndex}`, [{ validator, trigger }])
                        }
                    });
                });
            },
            submit: function() {
                //TODO: 收到后台的错误信息后没有做显示
                this.loadingText = "正在为您修改配置";
                let submitData = this._.cloneDeep(this.configs).map(el => {
                    return {
                        id: el.id,
                        pageRules: el.pageRules.map(rule => {
                            delete rule.title;
                            delete rule.description;
                            return rule;
                        })
                    }
                });
                this.configLoading = true;
                this.$http
                    .post(`/api/OEM/setConfig/${this.curOemName}`, submitData)
                    .then(data => {
                        this.configLoading = false;
                        this.notify(data.data);
                    })
                    .catch(console.log);
            },
            preview: function() {
                this.$http
                    .post(`/api/OEM/preview/${this.curOemName}`)
                    .then(data => {
                        data = data.data;
                        if (data.status == "error") {
                            this.notify(data);
                        } else {
                            this.$notify({
                                title: "成功",
                                message: `Http服务开启成功，端口号:${data.port}\n 如果没有自动弹出窗口，请检查浏览器是否拦截`,
                                type: "success",
                                offset: 100,
                                duration: 0
                            });
                            setTimeout(() => {
                                window.open("http://" + window.location.hostname + ":" + data.port, "_blank");
                            }, 1000)
                        }
                    })
                    .catch(console.log);
            },
            download: function() {
                this.configLoading = true;
                this.loadingText = "正在为您压缩代码";
                this.$http
                    .post(`/api/OEM/compress/${this.curOemName}`)
                    .then(data => {
                        this.configLoading = false;
                        let a = document.createElement("a");
                        //这种请求时get的
                        a.href = `/api/OEM/download/${this.curOemName}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    })
                    .catch(console.log);
            },
            showDoc() {
                window.open("https://github.com/Zhuyi731/Tenda_CI_server/blob/dev/docs/OEM%E8%87%AA%E5%8A%A8%E5%8C%96%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3.md", "_blank");
            },
            addNewLine() {},
            resetToDefault(field) {
                let tabIndex = field.split("_")[0],
                    itemIndex = field.split("_")[1],
                    config = this.configs[tabIndex].pageRules[itemIndex];

                this.$confirm(`确定要将${config.title}的值恢复至默认吗？`)
                    .then(() => {
                        this.$set(config, "value", config.webOptions.defaultValue);
                    })
                    .catch(console.error);
            }
        },
        created() {
            this.$http
                .post("/api/OEM/getBaseLines")
                .then(data => {
                    this.baseLines = data.data;
                })
                .catch(console.log);
        },
    }
</script>

<style lang="scss">
    .creat-oem-btn {
        width: 220px;
    }

    .baseline {
        border: 1px solid #ebebeb;
        padding: 30px 20px;
        border-radius: 3px;
        width: 300px;
    }

    .baseline-left {
        float: left;
    }

    .baseline-right {
        width: 700px;
        margin-left: 20px;
        float: left;
    }

    .baseline-bottom {
        margin-top: 30px;
    }

    .el-select {
        width: 100%;
    }

    .el-color-picker {
        width: 100%;

        .el-color-picker__trigger {
            width: 100%;
        }
    }

    .tips {
        margin-left: 15px;
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