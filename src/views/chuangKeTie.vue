<template>
  <div class="chuang-ke-tie">
    <template v-if="!hasLogin">
      <Button @click="login">请登录</Button>
    </template>

    <template v-else>
      <div>已登录，请选择图片！</div>
      <Button @click="uploadFile">上传图片</Button>

      <div style="display: flex; flex-wrap: wrap; align-items: center">
        <template v-for="item of handledUrlList" :key="item">
          <img style="margin: 20px" width="150" height="150" :src="item" alt="" />
        </template>
      </div>
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
    let handledUrlList = ref<string[]>([]);

    checkLoginStatus(webviewProp.partition).then((res) => {
      hasLogin.value = res;
    });

    const login = () => {
      isOpenLoginAuthDialog.value = true;
    };

    const uploadFile = () => {
      remote.dialog
        .showOpenDialog({
          properties: ['openFile', 'multiSelections'],
          filters: [
            {
              name: 'pic',
              extensions: ['png', 'jpg'],
            },
          ],
        })
        .then(async (res) => {
          if (!res.canceled) {
            for (let item of res.filePaths) {
              await kouTou(webviewProp.partition, item).then((url) => {
                handledUrlList.value.push('https:' + url);
              });
            }
          }
        });
    };

    return {
      webviewProp,
      hasLogin,
      isOpenLoginAuthDialog,
      handledUrlList,
      login,
      uploadFile,
    };
  },
});
</script>

<style lang="less" scoped></style>
