<script lang="tsx" setup>
import findDOMNode from '@/vc-util/Dom/findDOMNode';
import { getCurrentInstance } from 'vue';

const vm = getCurrentInstance();

defineExpose({
  get el() {
    return findDOMNode(vm);
  },
});
</script>
<template>
  <slot></slot>
</template>
