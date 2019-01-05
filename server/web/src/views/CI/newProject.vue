<template>
    <div class="container-box new-project">
        <project-form
            :form-model="form"
            label-width="260px"
            :is-loading="isLoading"
            @submit="submit"
        ></project-form>
    </div>
</template>

<script>
    import projectForm from "@/components/projectForm.vue";
    export default {
        components: {
            projectForm
        },
        data() {
            return {
                form: {
                    product: "",
                    productLines: [],
                    productLine: "",
                    isMultiLang: "0",
                    langPath: "",
                    compiler: "none",
                    src: "",
                    localDist: "",
                    dist: "",
                    members: [],
                    allMembers: [],
                    copyTos: [],
                    interval: "1",
                    compileOrder: ""
                },
                isLoading: true
            }
        },
        methods: {
            submit: function() {
                let submitData = this._.cloneDeep(this.form);
                delete submitData.allMembers;
                delete submitData.productLines;

                this.isLoading = true;
                this
                    .$http
                    .post("/api/CI/setNewPro", submitData).then((res) => {
                        this.isLoading = false;
                        this.notify(res.data);
                    });
            }
        },
        mounted: function() {
            this
                .$http
                .post("/api/CI/getProLine")
                .then(res => {
                    this.form.productLines = res.data.productLines.map(arr => arr.productLine);
                    this.form.allMembers = res.data.allMembers;
                    this.isLoading = false;
                })
                .catch(err => {
                    console.log(err)
                });
        }
    }
</script>
<style>
    .new-project .r-form {
        margin: 0 100px;
    }
</style>