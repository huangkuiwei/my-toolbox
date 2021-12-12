import { createApp } from 'vue';
import antd from 'ant-design-vue';
import App from '@/app.vue';
import router from '@/router';
import store from '@/store';

import 'ant-design-vue/dist/antd.css';

createApp(App).use(antd).use(store).use(router).mount('#app');
