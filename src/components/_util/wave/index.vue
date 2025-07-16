<script lang="tsx" setup>
import findDOMNode from '@/vc-util/Dom/findDOMNode';
import { getCurrentInstance, nextTick, onMounted, watch } from 'vue';
import type { WaveProps } from '.';

const props = defineProps<WaveProps>();

const instance = getCurrentInstance();

// let onClick: (e: MouseEvent) => void;

onMounted(() => {
  watch(
    () => props.disabled,
    async (val) => {
      const node = findDOMNode(instance);
      if (!node || node.nodeType !== 1 || val) return;
      await nextTick();
      // onClick = (e) => {
      //   if (
      //     !isVisible(e.target as HTMLElement) ||
      //     // No need wave
      //     !node.getAttribute ||
      //     node.getAttribute('disabled') ||
      //     (node as HTMLInputElement).disabled ||
      //     node.className.includes('disabled') ||
      //     node.className.includes('-leave')
      //   ) {
      //     return;
      //   }
      // };
    },
    { immediate: true },
  );
});
</script>
<template>
  <div>
    <slot></slot>
  </div>
</template>
