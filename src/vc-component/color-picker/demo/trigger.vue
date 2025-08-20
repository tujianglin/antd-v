<script lang="tsx" setup>
import Trigger from '@/vc-component/trigger';
import { computed, ref } from 'vue';
import type { Color } from '../color';
import ColorPicker from '../ColorPicker.vue';
import ColorBlock from '../components/ColorBlock.vue';
import builtinPlacements from './placements';
const prefixCls = 'rc-color-picker';

const value = ref<Color | string>('#1677ff');

const color = computed(() => (typeof value.value === 'string' ? value.value : value.value.toRgbString()));
</script>
<template>
  <Trigger action="click" :prefix-cls="prefixCls" popup-placement="bottomLeft" :builtin-placements="builtinPlacements">
    <template #popup>
      <ColorPicker v-model:value="value" />
    </template>
    <ColorBlock :color="color" :prefix-cls="prefixCls" />
  </Trigger>
</template>
<style lang="less">
@import '../assets/index.less';
</style>
