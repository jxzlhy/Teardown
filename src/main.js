import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import { BRAND } from './lib/brand.js';
import '@fontsource/noto-sans-sc/900.css';   /* 名字层：思源黑体 Black（webfont 分片懒加载，全平台一致；本地栈兜底） */
import './style.css';
import './ui/hud.css';

/* 馆牌唯一事实源在 brand.js（index.html 静态 title 与此处保持一致） */
document.title = `${BRAND.name} · ${BRAND.en}`;

/* 路由级代码分割：大厅不打包 three.js（约 600KB+），引擎只在进入设备页时按需加载 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./components/GalleryHub.vue') },
    { path: '/collection', component: () => import('./components/GalleryHub.vue') },   // 个人收藏馆（V2）：同壳不同厅
    { path: '/device/:id', component: () => import('./components/DeviceViewer.vue') },
    { path: '/compare/:group', component: () => import('./components/CompareView.vue') },
    { path: '/forge', component: () => import('./components/ForgeView.vue') },   // 机械锻造所（V3.0）：程序化生成入口
    { path: '/studio', component: () => import('./components/StudioView.vue') }, // 创作工作室（V5.0）：导入/体检入口
    { path: '/graph', component: () => import('./components/GraphView.vue') },
    { path: '/timeline', component: () => import('./components/TimelineView.vue') },
  ]
});

createApp(App).use(router).mount('#app');
