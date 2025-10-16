<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed } from 'vue';
import type { SeparatorProps } from './interface';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { index, prefixCls, separator, class: semanticClassName, style: semanticStyle } = defineProps<SeparatorProps>();

const separatorNode = computed(() =>
  typeof separator === 'function' ? (separator as (index: number) => VueNode)(index) : separator,
);
</script>
<template>
  <span v-if="separatorNode" :class="clsx(`${prefixCls}-separator`, semanticClassName)" :style="semanticStyle">
    <Render :content="separatorNode" />
  </span>
</template>
