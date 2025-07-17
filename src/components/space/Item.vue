<script lang="tsx" setup>
import { computed, useSlots, type CSSProperties } from 'vue';
import type { RenderNode } from '../_util/type';
import Render from '../render';
import { useSpaceContextInject } from './context';
export interface ItemProps {
  class: string;
  prefix: string;
  index: number;
  separator?: RenderNode;
  style?: CSSProperties;
  classNames: Partial<Record<'separator', string>>;
  styles: Partial<Record<'separator', CSSProperties>>;
}

const props = defineProps<ItemProps>();

const { latestIndex } = useSpaceContextInject();

const children = computed(() => useSlots().default?.().length);
</script>
<template>
  <template v-if="children">
    <div :class="props.class" :style="props.style">
      <slot></slot>
    </div>
    <span v-if="props.index < latestIndex && props.separator">
      <Render :content="props.separator" />
    </span>
  </template>
</template>
