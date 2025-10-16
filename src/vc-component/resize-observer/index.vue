<script lang="tsx" setup>
import Render from '@/vc-component/render';
import { ref } from 'vue';
import SingleObserver from './SingleObserver/index.vue';

export interface SizeInfo {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
}
export type OnResize = (size: SizeInfo, element: HTMLElement) => void;
export interface ResizeObserverProps {
  /** Pass to ResizeObserver.Collection with additional data */
  data?: any;
  disabled?: boolean;
  /** Trigger if element resized. Will always trigger when first time render. */
  onResize?: OnResize;
}

defineOptions({ name: 'ResizeObserver', inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = defineProps<ResizeObserverProps>();

const INTERNAL_PREFIX_KEY = 'rc-observer-key';

const mergedRef = ref();
const changeRef = (ele) => {
  mergedRef.value = ele?.el;
};

defineExpose({
  get el() {
    return mergedRef.value;
  },
});
</script>
<template>
  <SingleObserver
    v-for="(child, index) in $slots.default?.()"
    v-bind="props"
    :key="child?.key || `${INTERNAL_PREFIX_KEY}-${index}`"
    :ref="index === 0 ? changeRef : undefined"
  >
    <Render :content="child" />
  </SingleObserver>
</template>
