<script lang="tsx" setup>
export interface SummaryProps {
  fixed?: boolean | 'top' | 'bottom';
}

defineProps<SummaryProps>();
</script>
<template>
  <slot></slot>
</template>
