<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary"  @click="addRolesDialog = true">添加角色</el-button>
      <el-table :data="rolesList">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :class="['bdbottom',i1 === 0 ? 'bdtop':'','vcenter']" :key="item1.id">
              <!-- 一级 -->
              <el-col :span="5">
                  <el-tag>{{item1.authName}}</el-tag><i class="el-icon-caret-right"></i></el-col>
              <!-- 二、三级 -->
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '':'bdtop','vcenter']">
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag><i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="editorRole(scope.row)">编辑</el-button>
              <el-button type="danger" size="mini" @click="removeRole(scope.row.id)">删除</el-button>
              <el-button type="success" size="mini" @click="setRight(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
      <el-dialog title="提示" :visible.sync="setRightDialog" width="30%" @close="setRightsDialogClosed">
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" ref="rightRef" default-expand-all :default-checked-keys="checkedList"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialog = false">取 消</el-button>
          <el-button type="primary" @click="allotRights ">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="addRolesDialog" width="30%" @close="addRoleClosed">
        <el-form :model="newRole" :rules="newRoleRules" ref="newRoleRef">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="newRole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="newRole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRolesDialog = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色信息 -->
      <el-dialog title="编辑" :visible.sync="editorRoleDialog" width="30%">
        <el-form :model="editorForm">
          <el-form-item label="角色名称">
            <el-input v-model="editorForm.roleName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editorForm.roleDesc" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editorRoleDialog = false">取 消</el-button>
          <el-button type="primary" @click="changeRole">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>
<script>
    export default {
        data() {
            return {
                rolesList: [],
                setRightDialog:false,
                rightsList:[],
                treeProps:{
                  label:'authName',
                  children:'children'
                },
                checkedList:[],
                roleId:'',
                addRolesDialog : false,
                newRole:{
                  roleName:'',
                  roleDesc:''
                },
                newRoleRules:{
                  roleName:[
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                  ]
                },
                editorRoleDialog:false,
                editorForm:{}
            }
        },
        created() {
            this.getRolesList()
        },
        methods: {
            async getRolesList() {
                const {data: res} = await this.$http.get('roles')
                if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
                this.rolesList = res.data
            },
            async removeRightById(role,rightId){
              const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).catch(err =>err)
              if(confirmResult !== 'confirm') return this.$message.info('已取消删除！')
              const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
              if(res.meta.status !== 200) return this.$message.error('删除失败！')
              this.$message.success('删除成功！')
              role.children = res.data
            },
            async setRight(role){
              this.roleId = role.id
              const {data : res} = await this.$http.get('rights/tree')
              if(res.meta.status !== 200){
                return this.$message.error('获取权限列表失败！')
              }
              this.rightsList = res.data
              this.getLeafKeys(role,this.checkedList)
              this.setRightDialog = true
            },
            //通过递归获取数组
            getLeafKeys(node,arr){
              if(!node.children){
                return arr.push(node.id)
              }
              node.children.forEach(item=>this.getLeafKeys(item,arr))
            },
            setRightsDialogClosed(){
              this.checkedList = []
            },
            async allotRights(){
              const keys = [
                ...this.$refs.rightRef.getCheckedKeys(),
                ...this.$refs.rightRef.getHalfCheckedKeys()
              ];
              const rids = keys.join(',');
              const {data : res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids})
              if(res.meta.status !== 200) return this.$message.error('授权失败！')
              this.$message.success('授权成功！')
              this.setRightDialog = false
              this.getRolesList();
            },
            //添加角色
            // addRoles(){
            //   this.addRolesDialog = true
            // },
            addRoleClosed(){
              this.$refs.newRoleRef.resetFields()
            },
            async confirmAddRole(){
              const {data :res} = await this.$http.post('roles',this.newRole)
              if(res.meta.status !== 201) return this.$message.error('添加角色失败！')
              this.$message.success('添加角色成功！')
              this.addRolesDialog = false;
              this.getRolesList()
            },
            //根据ID删除角色
            async removeRole(id){
              const removeConfirm = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).catch(err=>err)
              if(removeConfirm !== 'confirm') {
                return this.$message.info("已取消删除")
              }
              const {data : res} = await this.$http.delete('roles/'+id)
              if(res.meta.status !== 200 ) return this.$message.error('删除失败！')
              this.$message.success('删除角色成功！')
              this.getRolesList()
            },
            //编辑角色信息
            editorRole(role){
              this.editorRoleDialog = true;
              this.editorForm = role
            },
            async changeRole(){
              const {data:res} = await this.$http.put('roles/'+this.editorForm.id,this.editorForm)
              if(res.meta.status !==200) return this.$message.error('提交失败！')
              this.editorRoleDialog = false;
              this.$message.success('修改成功！')
              this.getRolesList()
            }
        },
    }
</script>
<style lang="less" scoped>
.el-tag{
  margin: 10px;
}
.bdtop{
  border-top: 1px solid #E9EEF3;
}
.bdbottom{
  border-bottom: 1px solid #E9EEF3;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>