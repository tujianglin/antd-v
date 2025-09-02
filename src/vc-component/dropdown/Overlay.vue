<script lang="tsx" setup>
import { supportRef } from '@/vc-util/ref';
import { cloneVNode, ref } from 'vue';
import type { DropdownProps } from './Dropdown.vue';
export type OverlayProps = Pick<DropdownProps, 'overlay' | 'arrow' | 'prefixCls'>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { overlay, arrow, prefixCls } = defineProps<OverlayProps>();

const overlayNode = () => {
  let overlayElement;
  if (typeof overlay === 'function') {
    overlayElement = overlay();
  } else {
    overlayElement = overlay;
  }
  return overlayElement;
};

const composedRef = ref();
</script>
<template>
  <div v-if="arrow" :class="`${prefixCls}-arrow`"></div>
  <component :is="cloneVNode(overlayNode(), { ref: supportRef(overlayNode) ? composedRef : undefined })" />
</template>
