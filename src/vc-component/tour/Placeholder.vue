<script lang="tsx" setup>
import Portal from '@/vc-component/portal';
import type { PortalProps } from '@/vc-component/portal/index.vue';
import { ref, type CSSProperties } from 'vue';

export interface PlaceholderProps extends Pick<PortalProps, 'open' | 'autoLock' | 'getContainer'> {
  class: string;
  style: CSSProperties;
  fallbackDom: () => HTMLElement | null;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { open, autoLock, getContainer, class: className, style, fallbackDom } = defineProps<PlaceholderProps>();

const domRef = ref();

defineExpose({
  get el() {
    return domRef.value || fallbackDom();
  },
});
</script>
<template>
  <Portal :open="open" :auto-lock="autoLock" :get-container="getContainer">
    <div :class="className" :style="style" ref="domRef"></div>
  </Portal>
</template>
