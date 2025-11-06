<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { toRefs, type CSSProperties } from 'vue';
import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';
import { useSpaceContextInject } from './context';

export interface ItemProps {
  class: string;
  prefix: string;
  index: number;
  separator?: VueNode;
  style?: CSSProperties;
  classNames: SemanticClassNames<'separator'>;
  styles: SemanticStyles<'separator'>;
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
