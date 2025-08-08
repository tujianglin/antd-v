<script lang="tsx" setup>
import clsx from 'clsx';
import { computed } from 'vue';
import type { RenderNode } from '../../_util/type';
import Render from '../../render';
import type { SeparatorProps } from './interface';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { index, prefixCls, separator, class: semanticClassName, style: semanticStyle } = defineProps<SeparatorProps>();

const separatorNode = computed(() =>
  typeof separator === 'function' ? (separator as (index: number) => RenderNode)(index) : separator,
);
</script>
<template>
  <span v-if="separatorNode" :class="clsx(`${prefixCls}-separator`, semanticClassName)" :style="semanticStyle">
    <Render :content="separatorNode" />
  </span>
</template>
