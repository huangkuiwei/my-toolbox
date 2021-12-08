<template>
  <div class="chuang-ke-tie">
    <template v-if="!hasLogin">
      <Button @click="isOpenLoginAuthDialog = true">请登录</Button>
    </template>

    <template v-else>
      <div class="options">
        <Button @click="uploadFile">请选择图片</Button>
        <Checkbox v-model:checked="autoSave">自动保存</Checkbox>
        <div class="save">
          <span>保存路径：</span>
          <Input disabled v-model:value="savePath" />
          <span class="modify">修改保存路径</span>
        </div>
      </div>

      <div class="img-list">
        <div v-for="item of handledUrlList" :key="item">
          <img :src="item" alt="" />
        </div>
      </div>
    </template>

    <LoginAuthDialog
      v-if="isOpenLoginAuthDialog"
      :webviewProp="webviewProp"
      :visible="isOpenLoginAuthDialog"
      @update:visible="isOpenLoginAuthDialog = $event"
      @loginSuccess="hasLogin = true"
    />
  </div>
</template>

<script lang="ts">
import { Button, Checkbox, Input } from 'ant-design-vue';
import { ref, defineComponent } from 'vue';
import { remote } from 'electron';
import { CheckLoginStatus, ChuangKeTie } from '@/platform/chuangKeTie';
import LoginAuthDialog from '@/components/dialog/loginAuthDialog.vue';
import platformData from '@/data/platformData';

export default defineComponent({
  name: 'chuangKeTei',

  components: {
    LoginAuthDialog,
    Button,
    Checkbox,
    Input,
  },

  setup() {
    const webviewProp = platformData.chuangKeTie;
    let isOpenLoginAuthDialog = ref(false);
    let hasLogin = ref(false);
    let handledUrlList = ref<string[]>([]);
    let savePath = ref(localStorage.getItem('savePath') || remote.app.getPath('downloads'));
    let autoSave = ref(true);

    // 检测是否登录
    const checkLoginStatus = new CheckLoginStatus(webviewProp.partition);

    checkLoginStatus.check().then((res) => {
      hasLogin.value = res;
    });

    /**
     * 上传图片文件
     */
    const uploadFile = () => {
      remote.dialog
        .showOpenDialog({
          properties: ['openFile', 'multiSelections'],
          filters: [
            {
              name: 'pic',
              extensions: ['png', 'jpg', 'jpeg'],
            },
          ],
        })
        .then(async (res) => {
          if (!res.canceled) {
            let chuangKeTie = new ChuangKeTie(webviewProp.partition, res.filePaths);

            chuangKeTie.kouTou().then((imgUrlList) => {
              handledUrlList.value = imgUrlList;
            });
          }
        });
    };

    return {
      webviewProp,
      hasLogin,
      isOpenLoginAuthDialog,
      savePath,
      autoSave,
      handledUrlList,
      uploadFile,
    };
  },
});
</script>

<style lang="less" scoped>
.chuang-ke-tie {
  .options {
    display: flex;
    align-items: center;

    > .ant-checkbox-wrapper {
      margin: 0 20px;
    }

    > .save {
      display: flex;
      align-items: center;

      > .ant-input {
        width: 300px;
      }

      > .modify {
        margin-left: 10px;
        color: cornflowerblue;
        cursor: pointer;
      }
    }
  }

  .img-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    > div {
      margin: 0 auto;
      height: 250px;
      width: 250px;
      display: flex;
      align-items: center;
      justify-content: center;

      > img {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }
}
</style>
