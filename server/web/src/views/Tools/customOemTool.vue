<template>
    <div class="new-oem">
        <div class="baseline-left">
            <div class="baseline ">
                <el-form ref="form1" label-width="80px">
                    <el-form-item label="主线">
                        <el-select v-model="query.baseLine" @change="changeBaseLine">
                            <el-option v-for="(baseline,index) in baseLines" :key="index" :label="baseline" :value="baseline"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="OEM名称">
                        <el-input v-model="query.name"></el-input>
                    </el-form-item>
                    <el-form-item label="svn版本">
                        <el-input v-model="query.version" placeholder="svn版本(为空则使用最新版本)"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="creatOem" class="creat-oem-btn" type="primary">创建OEM</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="baseline baseline-bottom">
                <div class="help-wrap">
                    <el-button type="primary" @click="showDoc">开发文档</el-button>
                    <el-button type="success" @click="test">添加新主线</el-button>
                </div>
            </div>
        </div>

        <div class="baseline baseline-right">
            <el-container>
                <el-header>
                    <div class="el-form-item">
                        <label class="el-form-item__label">当前项目</label>
                        <div class="el-form-item__content" style="color:#409EFF;font-size:18px;font-weight:bold">{{curBaseLine}}</div>
                    </div>
                </el-header>
                <el-main>
                    <el-form ref="form2" label-width="180px" v-loading="configLoading" :element-loading-text="loadingText" show-message status-icon>
                        <el-tabs tab-position="left">
                            <el-tab-pane v-for="tabs in configs" :key="tabs.id" :label="tabs.title">
                                <el-form-item v-for="item in tabs.pageRules" :key="item.name" :label="item.title">
                                    <el-col :span="18" v-if="tabs.id!='img'">
                                        <el-input :placeholder="item.description" v-model="item.value"></el-input>
                                    </el-col>
                                    <el-col :span="18" v-if="tabs.id=='img'">
                                        <el-upload :action="'/api/OEM/uploadImg/'+curBaseLine" accept="image/jpeg,image/gif,image/png" name="replaceImg" multiple :limit="3" :on-exceed="handleExceed">
                                            <el-button size="small" type="primary">选择要替换的图片</el-button>
                                        </el-upload>
                                    </el-col>
                                    <el-col :span="6">
                                        <tips :type="item.type" :value="item.value" :detail="item.detail"></tips>
                                    </el-col>
                                </el-form-item>
                            </el-tab-pane>
                        </el-tabs>

                        <el-form-item v-show="hasData">
                            <el-button type="primary" @click="submit">上传配置</el-button>
                            <el-button type="success" @click="preview">预览界面</el-button>
                            <el-button type="danger" @click="download">下载代码</el-button>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
        </div>

    </div>
</template>

<script>
    import tips from "../../components/tips.vue";

    export default {
        data() {
            return {
                baseLines: {

                },
                configLoading: false,
                curBaseLine: "无",
                hasData: false,
                configs: [],
                query: {
                    baseLine: "",
                    name: "",
                    version: ""
                },
                loadingText: ""
            }
        },
        components: {
            tips
        },
        methods: {
            changeBaseLine: function(val) {
                this.query.name = `${val}-OEM`;
            },
            creatOem: function() {
                if (this.query.name == "" || this.query.baseLine == "") {
                    this.$message.error("请输入配置");
                    return;
                }
                this.configLoading = true;
                this.loadingText = "拼命加载配置中";
                this.$http
                    .post(`/api/OEM/creatOem`, this.query)
                    .then((res) => {
                        res = res.data;
                        if (res.status == "error") {
                            this.notify(res);
                        } else {
                            this.hasData = true;
                            this.curBaseLine = this.query.name;
                            this.configLoading = false;
                            this.configs = res.config;
                        }
                    })
            },
            submit: function() {
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
                    .post(`/api/OEM/setConfig/${this.curBaseLine}`, submitData)
                    .then(data => {
                        this.configLoading = false;
                        this.notify(data.data);
                    });
            },
            preview: function() {
                this.$http
                    .post(`/api/OEM/preview/${this.curBaseLine}`)
                    .then(data => {
                        data = data.data;
                        if (data.status == "error") {
                            this.notify(data);
                        } else {
                            this.$notify({
                                title: "成功",
                                message: `Http服务开启成功，端口号:${data.port}`,
                                type: "success",
                                offset: 100,
                                duration: 0
                            });
                            setTimeout(() => {
                                window.open("http://" + window.location.hostname + ":" + data.port, "_blank");
                            }, 1000)
                        }
                    });
            },
            download: function() {
                this.configLoading = true;
                this.loadingText = "正在为您压缩代码";
                this.$http
                    .post(`/api/OEM/compress/${this.curBaseLine}`)
                    .then(data => {
                        this.configLoading = false;
                        let a = document.createElement("a");
                        //这种请求时get的
                        a.href = `/api/OEM/download/${this.curBaseLine}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    });
            },
            showDoc() {

            },
            test() {

            }
        },
        created() {
            this.$http
                .post("/api/OEM/getBaseLines")
                .then(data => {
                    this.baseLines = data.data.baseLines;
                });
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
</style>