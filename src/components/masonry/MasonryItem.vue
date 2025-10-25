<script lang="tsx" setup>
import Render from '@/vc-component/render';
import ResizeObserver from '@/vc-component/resize-observer';
import type { VueKey, VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, useTemplateRef, type CSSProperties } from 'vue';
import type { MasonryProps } from './Masonry.vue';

export interface MasonryItemType<T = any> {
  key: VueKey;
  column?: number;
  height?: number;
  children?: VueNode;
  data: T;
}
interface MasonryItemProps<T = any> extends Pick<MasonryProps, 'itemRender'> {
  prefixCls: string;
  item: MasonryItemType<T>;
  style: CSSProperties;
  class?: string;
  index: number;
  column: number;
  onResize: VoidFunction | null;
}
defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { item, style, prefixCls, itemRender, class: className, index, column, onResize } = defineProps<MasonryItemProps>();

const itemPrefix = computed(() => `${prefixCls}-item`);

// ====================== Render ======================
const renderNode = computed(() => {
  return (
    item.children ??
    itemRender?.({
      ...item,
      index,
      column,
    })
  );
});

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value!;
  },
});
</script>
<template>
  <ResizeObserver v-if="onResize" @resize="onResize">
    <div ref="domRef" :style="style" :class="clsx(itemPrefix, className)">
      <Render :content="renderNode" />
    </div>
  </ResizeObserver>
  <div ref="domRef" v-else :style="style" :class="clsx(itemPrefix, className)">
    <Render :content="renderNode" />
  </div>
</template>
