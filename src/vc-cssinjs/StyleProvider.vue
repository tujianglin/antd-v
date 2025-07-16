<script lang="tsx" setup>
import type { StyleProviderProps } from './StyleContext';

defineOptions({
  name: 'StyleProvider',
  inheritAttrs: false,
});

defineProps<StyleProviderProps>();
</script>
<template>
  <slot></slot>
</template>
