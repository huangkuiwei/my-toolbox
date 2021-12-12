import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import ChuangKeTie from '@/views/chuangKeTie.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/chuangKeTie',
    name: '创客贴',
    component: ChuangKeTie,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
