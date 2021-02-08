<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index="true" index-text="#" border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="danger" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" @click="editor(scope.id)">编辑</el-button>
          <el-button type="danger" size="mini">删除</el-button>
        </template>
      </tree-table>
      <el-pagination :current-page="queryInfo.pagenum" :total="total" :page-size="queryInfo.pagesize"></el-pagination>
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
                total:0,
                columns:[
                  {label:'分类名称',prop:'cat_name'},
                  {label:'是否有效',type:'template',template:'isok'},
                  {label:'排序',type:'template',template:'order'},
                  {label:'操作',type:'template',template:'opt'},
                ],
                currentPage:1,
            }
        },
        created() {
            this.getProductList()
        },
        methods: {
            async getProductList() {
                const {data: res} = await this.$http.get('categories',{params:this.queryInfo})
                if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
                this.cateList = res.data.result
                this.total = res.total
            }
        },
    }
</script>
<style lang="less" scoped>

</style>