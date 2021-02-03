import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/users.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'
import ProductList from '../components/commodityManagement/productList.vue'

Vue.use(Router)

const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        {
            path: '/home',
            component: Home,
            redirect: '/welcome',
            children: [
                { path: '/welcome', component: Welcome },
                { path: '/users', component: Users },
                { path: '/rights', component: Rights },
                { path: '/roles', component: Roles },
                { path: '/goods', component: ProductList }
            ]
        },
    ]
})
router.beforeEach((to, from, next) => {
    if (to.path === "/login") return next();
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login')
    return next()
})
export default router;