<script lang="tsx" setup>
import clsx from 'clsx';
import { toRefs, type CSSProperties } from 'vue';
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

defineOptions({ inheritAttrs: false });

const { class: className, prefix, index, separator, style, classNames, styles } = defineProps<ItemProps>();

const { latestIndex } = toRefs(useSpaceContextInject());
</script>
<template>
  <template v-if="$slots.default">
    <div :class="className" :style="style">
      <slot></slot>
    </div>
    <span
      v-if="index < latestIndex && separator"
      :class="clsx(`${prefix}-item-separator`, classNames.separator)"
      :style="styles.separator"
    >
      <Render :content="separator" />
    </span>
  </template>
</template>
