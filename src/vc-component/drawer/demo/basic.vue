<script lang="tsx" setup>
import { ref } from 'vue';
import Drawer from '../index';
import motionProps from './motion';
const open = ref(false);
const onTouchEnd = () => {
  open.value = false;
};
const onSwitch = () => {
  open.value = !open.value;
};
const domRef = ref(null);
</script>
<template>
  <div style="position: relative">
    <div style="position: relative; height: 200px; overflow: auto; border: 1px solid red" ref="domRef">
      <button @click="onSwitch">打开</button>
    </div>
    <Drawer :get-container="false" :open="open" @close="onTouchEnd" placement="right" width="60%" v-bind="motionProps">
      content
    </Drawer>
  </div>
</template>
<style lang="less">
@import './assets/motion.less';
</style>
