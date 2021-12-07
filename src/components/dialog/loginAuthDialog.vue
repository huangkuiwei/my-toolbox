<template>
  <Modal
    class="login-auth"
    :visible="visible"
    :footer="false"
    @update:visible="$emit('update:visible', !visible)"
    @cancel="$emit('update:visible', false)"
  >
    <webview
      id="webview"
      :src="webviewProp.loginPage"
      :partition="webviewProp.partition"
      :preload="webviewProp.preload"
    />
  </Modal>
</template>

<script lang="ts">
import { Modal } from 'ant-design-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'loginAuth',

  props: {
    visible: {
      required: true,
      default: false,
    },

    webviewProp: {
      required: true,
      default: {},
    },
  },

  components: {
    Modal,
  },

  emits: ['update:visible'],
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
