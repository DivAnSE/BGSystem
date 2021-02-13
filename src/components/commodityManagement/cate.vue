<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" border>
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
                  <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                  <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCat(scope.row)">删除</el-button>
                </template>
        </tree-table>
        <el-pagination @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :total="total" :page-size="queryInfo.pagesize" layout="total, prev, pager, next"></el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"  @close="addCateDialogClosed">
          <!-- 添加分类表单 -->
          <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRuleForm" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类" prop="cat_pid">
              <el-cascader expand-trigger='hover' v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable></el-cascader>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
</div>
</template>
<script>
    export default {
        data() {
            return {
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                cateList: [],
                total: 0,
                columns: [{
                    label: '分类名称',
                    prop: 'cat_name'
                }, {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok'
                }, {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                }, {
                    label: '操作',
                    type: 'template',
                    template: 'opt'
                }, ],
                currentPage: 1,
                //用来显示或隐藏添加分类对话框
                addCateDialogVisible: false,
                addCateForm:{
                  cat_name:'',
                  cat_pid:1,
                  cat_level:0
                },
                //添加分类校验规则
                addCateFormRules:{
                  //验证规则
                  cat_name:[ {required:true , message:'请输入分类名称',trigger:'blur'} ]
                },
                //保存1,2级父级分类的列表
                parentCateList:[],
                cascaderProps:{
                  value:'cat_id',
                  label:'cat_name',
                  children:'children'
                },
                //绑定用户选择的分类值
                selectedKeys:[]
            }
        },
        created() {
            this.getProductList()
        },
        methods: {
            async getProductList() {
                const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
                if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
                this.cateList = res.data.result
                this.total = res.data.total
            },
            handleCurrentChange(newPage){
              //当pagenum发生改变时触发
              this.queryInfo.pagenum = newPage;
              this.getProductList();
            },
            showAddCateDialog() {
              //调用getParentCateList获取分类列表
              this.getParentCateList()
              //显示添加分类对话框
              this.addCateDialogVisible = true
            },
            async getParentCateList(){ 
              //获取父级分类数据列表
              const { data: res } = await this.$http.get('categories', {params: {type:2}})
              if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类列表数据失败')
              }
              this.parentCateList = res.data
            },
            parentCateChange(){
              //级联菜单中选择项发生变化时触发
              console.log(this.selectedKeys);
              //如果用户选择了父级分类 
              if(this.selectedKeys.length > 0){
                //则将数组中的最后一项设置为父级分类
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                //level也要跟着发生变化
                this.addCateForm.cat_level = this.selectedKeys.length
                return
              }else{
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
                return
              }
            },
            addCateDialogClosed(){
              //当关闭添加分类对话框时，重置表单
              this.$refs.addCateFormRuleForm.resetFields()
              this.selectedKeys = [];
              this.addCateForm.cat_pid = 0
              this.addCateForm.cat_level = 0
            },
            addCate() {
              //点击确定，完成添加分类
              this.$refs.addCateFormRuleForm.validate(async valid => {
                if (!valid) return
                //发送请求完成添加分类
                const { data: res } = await this.$http.post(
                  'categories',
                  this.addCateForm
                )

                if (res.meta.status !== 201) {
                  return this.$message.error('添加分类失败')
                }

                this.$message.success('添加分类成功')
                this.getProductList()
                this.addCateDialogVisible = false
              })
            },
            async removeCat(cat){
              const confirm =await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).catch(err=>err)
              if(confirm !== confirm){
                this.$message.info("已取消删除")
              }
              const{data : res} = await this.$http.delete("categories/"+cat.cat_id)
              if(res.meta.status !== 200){
                this.$message.error("删除失败")
              }
              this.$message.success("删除成功")
              this.getProductList();
            }
        },
    }
</script>
<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>