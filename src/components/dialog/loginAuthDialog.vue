<template>
  <a-modal
    class="login-auth"
    :footer="false"
    :visible="visible"
    @update:visible="$emit('update:visible', !visible)"
    @cancel="close"
  >
    <webview
      ref="webviewRef"
      id="webview"
      :useragent="userAgent"
      :src="webviewProp.loginPage"
      :partition="webviewProp.partition"
      :preload="webviewProp.preload"
    />
  </a-modal>
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
const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36';

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
  top: 25px !important;
  padding-bottom: 0 !important;
  width: calc(100% - 50px) !important;
  height: calc(100vh - 50px) !important;

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
        top: 50px;
        bottom: 0;
      }
    }
  }
}
</style>
