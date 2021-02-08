<template>
    <el-container>
        <el-header>
            <h2>电商后台管理系统</h2>
            <el-button type="warning" @click="logout">退出</el-button>
        </el-header> 
        <el-container>
            <el-aside width="200px">
                <el-menu background-color="#D3DCE6" text-color="#545c64" active-text-color="#409fff" unique-opened router :default-active="activePath">
                    <el-submenu :index="item.id + ' '" v-for="item in menuList" :key="item.id"> 
                        <template slot="title">
                            <i :class="iconObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data(){
        return{
            menuList:[],
            iconObj:{
                '125':'iconfont icon-users',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao'
            },
            activePath:''
        }
    },
    created(){
        this.getMenuList();
        this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods:{
        async getMenuList(){
            const {data:res} = await this.$http.get('menus')
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
            this.menuList = res.data
            console.log(this.menuList);
        },
        logout(){
            window.sessionStorage.clear('token');
            this.$router.push('/login')
        },
        saveNavState(activePath){
            window.sessionStorage.setItem('activePath',activePath);
            this.activePath = activePath;
        }
    }
}
</script>
<style lang="less" scoped>
    .el-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
  }
  
  .el-aside {
    background-color: #D3DCE6;
    border-right: 0;
  }
  
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    padding: 15px;
  }
  
  body > .el-container {
    margin-bottom: 40px;
  }
  
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
  .is-vertical{
      height: 100%;
  }
  .iconfont{
      margin-right: 8px;
  }
</style>