<template>
  <Modal
    class="login-auth"
    :footer="false"
    :visible="visible"
    @update:visible="$emit('update:visible', !visible)"
    @cancel="close"
  >
    <webview
      ref="webview"
      id="webview"
      :src="webviewProp.loginPage"
      :partition="webviewProp.partition"
      :preload="webviewProp.preload"
    />
  </Modal>
</template>

<script lang="ts">
import { Modal, message } from 'ant-design-vue';
import { defineComponent } from 'vue';
import { remote, WebviewTag } from 'electron';

interface Data {
  webview: WebviewTag | null;
  homePage: string;
}

export default defineComponent({
  name: 'loginAuth',

  props: {
    visible: {
      required: true,
      default: false,
    },

    webviewProp: {
      required: true,
      default: () => ({
        partition: '',
      }),
    },
  },

  emits: ['update:visible'],

  components: {
    Modal,
  },

  data(): Data {
    return {
      webview: null,
      homePage: 'https://www.chuangkit.com/designtools/designindex',
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.webview = this.$refs.webview as WebviewTag;

      this.webview.addEventListener('dom-ready', () => {
        if (this.webview) {
          let id = this.webview.getWebContentsId();
          let webContent = remote.webContents.fromId(id);
          webContent.openDevTools();
        }
      });

      this.webview.addEventListener('did-navigate', (event) => {
        if (event.url === this.homePage) {
          // 登录成功
          message.success('登录成功');
          this.close();
        }
      });
    });
  },

  methods: {
    close() {
      this.$emit('update:visible', false);
    },
  },
});
</script>

<style lang="less">
.login-auth {
  top: 20px;
  width: calc(100% - 40px) !important;
  height: calc(100vh - 40px);

  .ant-modal-content {
    height: 100%;

    .ant-modal-body {
      height: 100%;
      padding: 0;
      position: relative;

      #webview {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
      }
    }
  }
}
</style>
