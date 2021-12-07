<template>
  <div class="chuang-ke-tie">
    <Button v-if="!hasLogin" @click="login">请登录</Button>

    <LoginAuthDialog v-model:visible="isOpenLoginAuthDialog" :webviewProp="webviewProp" />
  </div>
</template>

<script lang="ts">
import { Button } from 'ant-design-vue';
import { ref, defineComponent } from 'vue';
import { remote } from 'electron';
import { checkLoginStatus } from '@/platform/chuangKeTie';
import LoginAuthDialog from '@/components/dialog/loginAuthDialog.vue';
import platformData from '@/data/platformData';

export default defineComponent({
  name: 'chuangKeTei',

  components: {
    LoginAuthDialog,
    Button,
  },

  setup() {
    console.log(remote.app.getAppPath());

    const webviewProp = platformData.chuangKeTie;
    let isOpenLoginAuthDialog = ref(false);
    let hasLogin = ref(false);

    checkLoginStatus().then((res) => {
      hasLogin.value = res;
    });

    const login = () => {
      isOpenLoginAuthDialog.value = true;
    };

    return {
      webviewProp,
      hasLogin,
      isOpenLoginAuthDialog,
      login,
    };
  },
});
</script>

<style lang="less" scoped></style>
