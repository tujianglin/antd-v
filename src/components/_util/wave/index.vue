<script lang="tsx" setup>
import { useConfigContextInject } from '@/components/config-provider';
import findDOMNode from '@/vc-util/Dom/findDOMNode';
import isVisible from '@/vc-util/Dom/isVisible';
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, useSlots, watch } from 'vue';
import type { WaveProps } from '.';
import useStyle from './style';
import { cn } from '@/utils/cn';
import useWave from './useWave';

const props = defineProps<WaveProps>();

const instance = getCurrentInstance();

const { getPrefixCls } = useConfigContextInject();

const prefixCls = getPrefixCls('wave');
const [, hashId] = useStyle(prefixCls);

const showWave = useWave(
  computed(() => cn(prefixCls, hashId)),
  props.component,
  computed(() => props.colorSource),
);

let onClick: (e: MouseEvent) => void;

const clear = () => {
  const node = findDOMNode(instance) as HTMLElement;
  node.removeEventListener('click', onClick, true);
};

onMounted(() => {
  watch(
    () => props.disabled,
    async (val) => {
      const node = findDOMNode(instance);
      node?.removeEventListener('click', onClick, true);
      if (!node || node.nodeType !== 1 || val) return;
      await nextTick();
      onClick = (e: MouseEvent) => {
        if (
          !isVisible(e.target as HTMLElement) ||
          // No need wave
          !node.getAttribute ||
          node.getAttribute('disabled') ||
          (node as HTMLInputElement).disabled ||
          node.className.includes('disabled') ||
          node.className.includes('-leave')
        ) {
          return;
        }
        showWave(e);
      };
      node.addEventListener('click', onClick, true);
    },
    { immediate: true, flush: 'post' },
  );
});
onBeforeUnmount(() => {
  clear();
});

const slots = useSlots();

const Children = () => {
  return <>{slots.default?.()[0]}</>;
};
</script>
<template>
  <Children />
</template>
