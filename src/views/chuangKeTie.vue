<template>
  <div class="chuang-ke-tie">
    <template v-if="!hasLogin">
      <Button @click="login">请登录</Button>
    </template>

    <template v-else>
      <div>已登录，请选择图片！</div>
      <Button @click="uploadFile">上传图片</Button>
    </template>

    <LoginAuthDialog
      v-if="isOpenLoginAuthDialog"
      :visible="isOpenLoginAuthDialog"
      @update:visible="isOpenLoginAuthDialog = $event"
      :webviewProp="webviewProp"
    />
  </div>
</template>

<script lang="ts">
import { Button } from 'ant-design-vue';
import { ref, defineComponent } from 'vue';
import { checkLoginStatus, kouTou } from '@/platform/chuangKeTie';
import LoginAuthDialog from '@/components/dialog/loginAuthDialog.vue';
import platformData from '@/data/platformData';
import { remote } from 'electron';
import crypto from 'crypto';
import * as fs from 'fs';

export default defineComponent({
  name: 'chuangKeTei',

  components: {
    LoginAuthDialog,
    Button,
  },

  setup() {
    const webviewProp = platformData.chuangKeTie;
    let isOpenLoginAuthDialog = ref(false);
    let hasLogin = ref(false);
    let md5 = ref('');

    checkLoginStatus(webviewProp.partition).then((res) => {
      hasLogin.value = res;
    });

    const login = () => {
      isOpenLoginAuthDialog.value = true;
    };

    const uploadFile = () => {
      remote.dialog
        .showOpenDialog({
          properties: ['openFile'],
        })
        .then((res) => {
          if (!res.canceled) {
            let filePath = res.filePaths[0];
            const buffer = fs.readFileSync(filePath);
            const hash = crypto.createHash('md5');
            hash.update(buffer);
            md5.value = hash.digest('hex');

            kouTou(
              webviewProp.partition,
              {
                md5: md5.value,
              },
              filePath,
            ).then((res) => {
              console.log(res);
            });
          }
        });
    };

    return {
      webviewProp,
      hasLogin,
      isOpenLoginAuthDialog,
      login,
      uploadFile,
    };
  },
});
</script>

<style lang="less" scoped></style>
