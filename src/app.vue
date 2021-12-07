<template>
  <div id="app">
    <app-platform />

    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import appPlatform from '@/components/base/appPlatform.vue';

export default defineComponent({
  name: 'app',

  components: {
    appPlatform,
  },
});
</script>

<style lang="less"></style>
