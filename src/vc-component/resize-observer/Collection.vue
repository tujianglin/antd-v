<script lang="tsx" setup>
import { shallowRef } from 'vue';
import { CollectionContextProvider, useCollectionContextInject } from './context';
import type { SizeInfo } from './index.vue';
export interface ResizeInfo {
  size: SizeInfo;
  data: any;
  element: HTMLElement;
}

export interface CollectionProps {
  /** Trigger when some children ResizeObserver changed. Collect by frame render level */
  onBatchResize?: (resizeInfo: ResizeInfo[]) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { onBatchResize } = defineProps<CollectionProps>();

const resizeIdRef = shallowRef(0);
const resizeInfosRef = shallowRef<ResizeInfo[]>([]);

const onCollectionResize = useCollectionContextInject();

const onResize = (size, element, data) => {
  resizeIdRef.value += 1;
  const currentId = resizeIdRef.value;

  resizeInfosRef.value.push({
    size,
    element,
    data,
  });

  Promise.resolve().then(() => {
    if (currentId === resizeIdRef.value) {
      onBatchResize?.(resizeInfosRef.value);
      resizeInfosRef.value = [];
    }
  });

  // Continue bubbling if parent exist
  onCollectionResize?.(size, element, data);
};
</script>
<template>
  <CollectionContextProvider :value="onResize"><slot></slot></CollectionContextProvider>
</template>
