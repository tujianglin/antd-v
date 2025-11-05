<script setup lang="tsx">
import type { CSSProperties } from 'vue';

export interface FooterRowProps {
  class?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent) => void;
}

const props = defineProps<FooterRowProps>();
</script>

<template>
  <tr v-bind="props">
    <slot></slot>
  </tr>
</template>
