<script lang="tsx" setup>
import { type CSSProperties } from 'vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { style, prefixCls } = defineProps<{ style?: CSSProperties; prefixCls?: string }>();
</script>
<template>
  <div :class="`${prefixCls}-palette`" :style="{ position: 'relative', ...style }"><slot></slot></div>
</template>
