<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>
<script>
    export default {
        data() {
            return {
                productList: []
            }
        },
        created() {
            this.getProductList()
        },
        methods: {
            async getProductList() {
                const {data: res} = await this.$http.get('categories/:id/attributes')
                if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
                this.productList = res.data
                console.log(this.productList);
            }
        },
    }
</script>
<style lang="less" scoped>

</style>