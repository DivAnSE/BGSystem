<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" show-icon type="warning" :closable="false"></el-alert>
      <div class="block">
        <el-row :gutter="10">
          <el-col :span="3" class="grid-content"><span>选择商品分类：</span></el-col>
          <el-col :span="6"><el-cascader :options="cateList" :props="cateListOptions" @change="selectCate"></el-cascader></el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>
<script>
    export default {
        data() {
            return {
              queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
              },
                cateList: [],
                cateListOptions:{
                  expandTrigger: 'hover',
                  value:'cat_id',
                  label:'cat_name',
                  children:'children'
                }
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            async getCateList() {
                const {data: res} = await this.$http.get('categories',this.queryInfo)
                if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
                this.cateList = res.data
                console.log(this.cateList);
            },
            selectCate(item){
              console.log(item);
            }
        },
    }
</script>
<style lang="less" scoped>
.block{
  margin: 15px 0;
}
.grid-content{
  height: 41px;
  width: 130px;
  line-height: 41px;
}
</style>