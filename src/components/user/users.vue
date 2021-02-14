<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList"></el-input>
        </el-col>
        <el-col :span="2" class="searchBtn">
          <el-button  type="primary" icon="el-icon-search" @click="getUserList"></el-button>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button type="success" @click='addUser'>添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data='userList' stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username" align="center"></el-table-column>
        <el-table-column label="邮箱" prop="email" align="center"></el-table-column>
        <el-table-column label="电话" prop="mobile" align="center"></el-table-column>
        <el-table-column label="角色" prop="role_name" align="center"></el-table-column>
        <el-table-column label="状态" prop="mg_state" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="gray" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="300px">
          <template slot-scope="scope">
            <el-button @click="modifyInfo(scope.row.id)" type="primary" size="mini">修改</el-button>
            <el-button @click="delUser(scope.row.id)" type="danger" size="mini">删除</el-button>
            <el-button @click="assignRoles(scope.row)" type="success" size="mini">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next"  @current-change="handleCurrentChange" :page-size="queryInfo.pagesize" :total="total"></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialog" width="30%" @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog=false">取 消</el-button>
        <el-button type="primary" @click="confirmAddUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="modifyUserDialog" width="30%" @close="modifyDialogClosed">
      <el-form ref="modifyFormRef" :model="modifyForm" :rules="modifyFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="modifyForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="modifyForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="modifyForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyUserDialog=false">取 消</el-button>
        <el-button type="primary" @click="confirmModifyUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色dialog -->
    <el-dialog title="分配角色" :visible.sync="assignRolesDialog" @close="assignRolesDialogClosed">
      <el-form :model="form" ref="assignRoleRef">
        <el-form-item label="选择角色">
          <el-select v-model="form.region" placeholder="请选择角色" @change="selRolesName">
            <el-option v-for="(item,index) in rolesList" :key="index" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAssign">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      userList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      addUserDialog:false,
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      addFormRules:{
        username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
          ],
        password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
          ],
        email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' }
          ],
        mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' }
          ],
      },
      modifyUserDialog:false,
      modifyForm:{},
      modifyFormRules:{
        username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
          ],
          email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' }
          ],
        mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' }
          ],
      },
      rolesList:[],
      assignRolesDialog:false,
      roleId:'',
      userId:'',
      form: {
          region: ''
        },
    }
  },
  created () {
    this.getUserList();
  },
  methods: {
    //获取用户列表数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total
    },
    addUser () {
      this.addUserDialog = true;
    },
    async changeState (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    handleCurrentChange (newPageNum) {
      this.queryInfo.pagenum = newPageNum;
      this.getUserList();
    },
    //添加新用户
    confirmAddUser(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        //发起请求
        const {data:res} = await this.$http.post('users',this.addForm)
        if(res.meta.status !== 201){
          this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.addUserDialog = false;
        this.getUserList();
      })
    },
    //关闭对话框
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //修改用户
    async modifyInfo(id){
      this.modifyUserDialog = true;
      const {data:res} = await this.$http.get(`users/${id}/`)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.modifyForm = res.data;
    },
    modifyDialogClosed(){
      this.$refs.modifyFormRef.resetFields()
    },
    confirmModifyUser(){
      this.$refs.modifyFormRef.validate(async valid=>{
        if(!valid) return;
        const {data:res} = await this.$http.put('users/'+this.modifyForm.id,
        {email:this.modifyForm.email,mobile:this.modifyForm.mobile})
        if(res.meta.status !==200) return this.$message.error('修改用户信息失败！')
        this.$message.success('修改用户信息成功！');
        this.modifyUserDialog = false;
        this.getUserList()
      })
    },
    async delUser(id){
        const confirm = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirm !== 'confirm') {
          return this.$message(
            {
              type: 'info',
              message: '已取消删除'
            }
          )
        }
        const {data:res} = await this.$http.delete('users/'+id)
        if(res.meta.status !== 200) return this.$message.error("删除失败")
        this.$message.success("删除成功");
        this.getUserList();
    },
    //分配角色
    assignRoles(user){
      this.assignRolesDialog = true
      this.getRolesList();
      this.userId = user.id
    },
    //获取角色列表
    async getRolesList(){
      const{data : res} =await this.$http.get('roles')
      if(res.meta.status!==200) this.$message.error("获取角色列表失败！")
      this.rolesList = res.data
    },
    selRolesName(id){
      this.roleId = id
    },
    async confirmAssign(){
      const {data : res} = await this.$http.put(`users/${this.userId}/role`,{rid:this.roleId})
      if(res.meta.status !== 200) return this.$message.error("角色分配失败！")
      this.$message.success("角色分配成功！")
      this.assignRolesDialog = false
      this.getUserList();
    },
    assignRolesDialogClosed(){
      this.$refs.assignRoleRef.resetFields();
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.searchBtn{
  padding-left: 0;
}
</style>