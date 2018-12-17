<template>
    <div>
        <div style="margin:20px auto">
            <el-steps :space="500" :active="activeStep" align-center finish-status="success" process-status="procecss">
                <el-step title="基础配置"></el-step>
                <el-step title="编译配置"></el-step>
                <el-step title="翻译配置"></el-step>
            </el-steps>
        </div>
        <el-form ref="form1" size="medium" v-show="activeStep==0" status-icon :model="formModel" :label-width="labelWidth" :rules="formRules" class="r-form" v-loading="isLoading">
            <el-form-item label="项目名称" prop="product" placeholder="项目名称，配置后无法修改">
                <el-input v-model="formModel.product" :disabled="isEdit"></el-input>
            </el-form-item>

            <el-form-item label="项目运行状态" prop="status">
                <el-select v-model="formModel.status" placeholder="项目运行状态">
                    <el-option value="running" label="运行中"></el-option>
                    <el-option value="pending" label="暂停"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="归入产品线" prop="productLine">
                <el-select allow-create filterable v-model="formModel.productLine" placeholder="填入或选择项目对应的产品线">
                    <el-option v-for="item in formModel.productLines" :key="item" :label="item" :value="item">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="项目成员" prop="members">
                <el-select multiple v-model="formModel.members" placeholder="选择项目成员(多选)">
                    <el-option v-for="item in formModel.allMembers" :key="item.mail" :label="item.name" :value="item.mail">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="邮件抄送" prop="copyTo">
                <el-select allow-create filterable multiple v-model="formModel.copyTo" placeholder="写入抄送人员邮箱前缀(例如:pengjuanli)">
                    <el-option v-for="item in formModel.allMembers" :key="item.mail" :label="item.mail" :value="item.mail">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="项目src路径" prop="src">
                <el-input v-model="formModel.src" placeholder="svn上项目的src路径"></el-input>
            </el-form-item>

            <el-form-item label="检测间隔" prop="interval">
                <el-input-number v-model="formModel.interval" controls-position="right" :step="1" :min="1" :max="7" label="检测间隔" :precision="0"></el-input-number>
                <span>(天)</span>
            </el-form-item>

        </el-form>

        <el-form ref="form2" v-show="activeStep==1" status-icon :model="formModel" :label-width="labelWidth" :rules="formRules" class="r-form" v-loading="isLoading">
            <el-form-item label="编译类型" prop="compiler">
                <el-select v-model="formModel.compiler" placeholder="打包工具">
                    <el-option label="无" value="none"> </el-option>
                    <el-option label="Webpack" value="webpack"></el-option>
                </el-select>
            </el-form-item>

            <div v-if="formModel.compiler != 'none'">
                <el-form-item label="编译后本地相对路径" prop="localDist">
                    <el-input v-model="formModel.localDist" placeholder="例如编译后在dist路径下，输入./dist"></el-input>
                </el-form-item>

                <el-form-item label="编译指令" prop="compileOrder">
                    <el-input v-model="formModel.compileOrder" placeholder="npm run build"></el-input>
                </el-form-item>

                <el-form-item label="项目dist路径" prop="dist">
                    <el-input v-model="formModel.dist" placeholder="svn上项目的dist路径"></el-input>
                </el-form-item>
            </div>
        </el-form>

        <el-form ref="form3" v-show="activeStep==2" status-icon :model="formModel" :label-width="labelWidth" :rules="formRules" class="r-form" v-loading="isLoading">
            <el-form-item label="是否为多国语言项目" prop="isMultiLang">
                <el-select v-model="formModel.isMultiLang">
                    <el-option value="0" label="否"></el-option>
                    <el-option value="1" label="是"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item v-if="formModel.isMultiLang == '1'" label="语言包相对路径" prop="langPath">
                <el-input v-model="formModel.langPath" placeholder="语言包相对与项目根目录的相对路径"></el-input>
            </el-form-item>
        </el-form>

        <el-button :disabled="activeStep==0" type="primary" @click="lastStep">上一步</el-button>
        <el-button type="primary" @click="nextStep">{{nextButtonText}}</el-button>
    </div>

</template>


<script>
    // import projectStatus from "@/components/statusMap.js";

    function pathValidator(rule, value, callback) {
        let regex = /^(http|https|\.\/|..\/)(.*)[^\/]$/;

        if (regex.test(value) && !/\s/.test(value)) {
            callback();
        } else {
            callback("请输入一个正确的地址");
        }
    }
    export default {
        props: ["formModel", "isLoading", "isEdit"],
        data() {
            return {
                labelWidth: "260px",
                activeStep: 0,
                nextButtonText: "下一步",
                formRules: {
                    product: [{
                        required: true,
                        message: '请输入项目名称',
                        trigger: 'blur'
                    }, {
                        min: 3,
                        max: 30,
                        message: "项目名称长度为3~30个中文或英文字符",
                        trigger: "blur"
                    }],
                    productLine: [{
                        required: true,
                        message: '请选择产品线',
                        trigger: 'change'
                    }],
                    status: [{
                        required: true,
                        message: '请选择项目运行状态',
                        trigger: 'change'
                    }],
                    members: [{
                        required: true,
                        message: '请加入至少一个项目成员'
                    }],
                    src: [{
                        required: true,
                        message: '请输入src路径',
                        trigger: "blur"
                    }, {
                        validator: pathValidator,
                        trigger: 'blur'
                    }],
                    interval: [{
                        required: true,
                        message: "请输入检测时间间隔",
                        trigger: "blur"
                    }],
                    localDist: [{
                        required: true,
                        message: "请输入编译后本地相对路径",
                        trigger: "blur"
                    }, {
                        validator: pathValidator,
                        trigger: 'blur'
                    }],
                    compileOrder: [{
                        required: true,
                        message: "请输入编译指令",
                        trigger: "blur"
                    }],
                    dist: [{
                        required: true,
                        message: "请输入项目dist路径",
                        trigger: "blur"
                    }, {
                        validator: pathValidator,
                        trigger: 'blur'
                    }],
                    langPath: [{
                        required: true,
                        message: "请输入语言包路径",
                        trigger: "blur"
                    }, {
                        validator: pathValidator,
                        trigger: "blur"
                    }]
                }
            }
        },
        methods: {
            lastStep: function() {
                this.nextButtonText = "下一步";
                this.activeStep > 0 && this.activeStep--;
            },
            nextStep: function() {
                switch (this.activeStep) {
                    case 0:
                        {
                            this.$refs["form1"].validate((valid) => {
                                if (valid) {
                                    this.activeStep++;
                                } else {
                                    this.$message.error("请检查表单输入");
                                    return false;
                                }
                            });
                        }
                        break;
                    case 1:
                        {
                            this.$refs["form2"].validate((valid) => {
                                if (valid) {
                                    this.nextButtonText = "立即创建";
                                    this.activeStep++;
                                } else {
                                    this.$message.error("请检查表单输入");
                                    return false;
                                }
                            });
                        }
                        break;
                    case 2:
                        {
                            this.$refs["form3"].validate((valid) => {
                                if (valid) {
                                    this.$emit("submit");
                                } else {
                                    this.$message.error("请检查表单输入");
                                    return false;
                                }
                            });
                        }
                        break;
                }
            }
        },
        computed: {
            isCompileProduct: function() {
                return this.formModel.compiler == "none" ? false : true;
            }
        }
    }
</script>