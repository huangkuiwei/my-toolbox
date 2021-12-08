<template>
  <div class="app-platform">
    <router-link to="/chuangKeTie">创客贴</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'appPlatform',
});
</script>

<style lang="less" scoped>
.app-platform {
  margin-bottom: 20px;
}
</style>
