<template>
  <div class="tip-box">
    <div class="tip-inner-box detail-box">
      <div>
        <i class="el-icon-question" style="color:#409EFF"></i>
        <p class="description" v-html="detailText"></p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["detail"],
    computed: {
      detailText: function () {
        return !!this.detail ? this.detail : "没有详细信息";
      }
    }
  }
</script>
<style lang="scss" scoped>
  .tip-box {
    height: 40px;
  }

  .tip-inner-box {
    height: 40px;
    line-height: 40px;
    float: left;
  }

  .color-box {
    width: 50px;
    height: 38px;
    line-height: 38px;
    display: inline-block;
    border: 1px solid #999;
  }

  .href-box {
    width: 50px;
    display: inline-block;
    a {
      color: #E6A23C;
      font-size: 10px;
    }
  }

  .detail-box {
    width: 15px;
    margin-right:10px;
    /* position: relative; */
    .description {
      position: fixed;
      content: "";
      top: 150px;
      right: 40px;
      background: #fff;
      width: 100px;
      opacity: 0;
      z-index: 999;
      word-wrap: break-word;
      word-break: break-word;
    }
  }

  .detail-box:hover {
    .description {
      opacity: 100;
      width: 200px;
      border-radius: 8px;
      border: 1px solid #999;
      height: auto;
      opacity: 1;
      transition: all 0.5s;
    }
  }

</style>
