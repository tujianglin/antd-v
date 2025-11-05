<script lang="tsx" setup>
import { type CSSProperties } from 'vue';
export interface TitleProps {
  class: string;
  style?: CSSProperties;
}
defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, style = {} } = defineProps<TitleProps>();
</script>
<template>
  <div :class="className" :style="style">
    <slot></slot>
  </div>
</template>
