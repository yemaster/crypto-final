import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import { createWebHistory, createRouter } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home', 
        component: () => import('./views/EncryptView.vue'),
        meta: { title: '单表置换加密' }
    },
    {
        path: '/decrypt',
        name: 'decrypt', 
        component: () => import('./views/DecryptView.vue'),
        meta: { title: '单表置换解密' }
    },
    {
        path: '/assist',
        name: 'assist', 
        component: () => import('./views/AssistView.vue'),
        meta: { title: '辅助解密' }
    },
]

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

const app = createApp(App)
const pinia = createPinia()

app.use(router).use(pinia).mount('#app')
