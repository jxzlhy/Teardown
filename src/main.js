import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import './style.css';
import './ui/hud.css';

/* 路由级代码分割：大厅不打包 three.js（约 600KB+），引擎只在进入设备页时按需加载 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./components/GalleryHub.vue') },
    { path: '/device/:id', component: () => import('./components/DeviceViewer.vue') },
  ]
});

createApp(App).use(router).mount('#app');
