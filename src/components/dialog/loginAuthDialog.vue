<template>
  <Modal
    class="login-auth"
    :footer="false"
    :visible="visible"
    @update:visible="$emit('update:visible', !visible)"
    @cancel="close"
  >
    <webview
      ref="webviewRef"
      id="webview"
      :src="webviewProp.loginPage"
      :partition="webviewProp.partition"
      :preload="webviewProp.preload"
    />
  </Modal>
</template>

<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { WebviewTag } from 'electron';
import { message } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
  webviewProp: WebViewProp;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'loginSuccess'): void;
}>();

const webviewRef = ref<WebviewTag>();

const close = () => {
  emit('update:visible', false);
};

onMounted(() => {
  webviewRef.value?.addEventListener('dom-ready', () => {
    webviewRef.value?.openDevTools();
  });

  webviewRef.value?.addEventListener('did-navigate', (event) => {
    if (event.url === props.webviewProp.homePage) {
      // 登录成功
      message.success('登录成功');
      emit('loginSuccess');
      close();
    }
  });
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
