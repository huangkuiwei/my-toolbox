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
          <span class="modify" @click="modifyPath">修改保存路径</span>
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
import { Button, Checkbox, Input, message, notification } from 'ant-design-vue';
import { defineComponent, ref, h } from 'vue';
import { remote, ipcRenderer, shell } from 'electron';
import { CheckLoginStatus, ChuangKeTie } from '@/platform/chuangKeTie';
import LoginAuthDialog from '@/components/dialog/loginAuthDialog.vue';
import platformData from '@/data/platformData';
import { autoDownloadPic } from '@/tools';
import { MessageType } from 'ant-design-vue/lib/message';

interface DownloadItem {
  success: boolean;
  filePath: string;
  fileName: string;
}

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
    let autoSave = ref(true);
    let downloadedList: DownloadItem[] = [];
    let downloadLoading: MessageType;

    let localSavePath = localStorage.getItem('savePath') || remote.app.getPath('downloads');
    ipcRenderer.send('setSaveData', localSavePath);
    let savePath = ref(localSavePath);

    // 监听下载事件
    ipcRenderer.on('downloadComplete', (event, info) => {
      downloadedList.push(info);

      // 全部下载完成关闭loading
      if (downloadedList.length === handledUrlList.value.length) {
        downloadLoading();

        notification.info({
          message: '下载完成！',
          duration: 0,
          placement: 'bottomRight',
          description: () => {
            const imgList = downloadedList.map((item) => {
              return h('div', {}, [
                h('div', { class: 'filename' }, item.fileName),
                h(
                  'div',
                  {
                    class: 'open',
                    onClick: () => {
                      shell.openPath(item.filePath);
                    },
                  },
                  '打开文件',
                ),
              ]);
            });

            return h('div', { class: 'download-notify' }, imgList);
          },
        });
      }
    });

    // 检测是否登录
    const checkLoginStatus = new CheckLoginStatus(webviewProp.partition);

    checkLoginStatus.check().then((res) => {
      hasLogin.value = res;
    });

    const modifyPath = () => {
      remote.dialog
        .showOpenDialog({
          properties: ['openDirectory'],
        })
        .then((res) => {
          if (!res.canceled) {
            const filePath = res.filePaths[0];
            savePath.value = filePath;
            localStorage.setItem('savePath', filePath);
            ipcRenderer.send('setSaveData', filePath);
            message.success('修改成功');
          }
        });
    };

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
            let handlerLoading = message.loading('正在处理中，请稍等...', 0);
            let chuangKeTie = new ChuangKeTie(webviewProp.partition, res.filePaths);
            handledUrlList.value = await chuangKeTie.kouTou();
            handlerLoading();

            if (autoSave.value) {
              downloadLoading = message.loading('处理完成，正在下载中，请稍等...', 0);

              handledUrlList.value.forEach((item) => {
                autoDownloadPic(item);
              });
              downloadedList = [];
            } else {
              message.success('处理完成');
            }
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
      modifyPath,
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

<style lang="less">
.download-notify {
  display: flex;
  flex-direction: column;

  > div {
    margin: 5px 0;
    display: flex;
    align-items: center;
    white-space: nowrap;

    > .filename {
      flex-grow: 1;
      margin-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > .open {
      color: cornflowerblue;
      flex-shrink: 0;
      cursor: pointer;
    }
  }
}
</style>
