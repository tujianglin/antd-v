<script lang="tsx" setup>
export interface PanelArrowProps {
  prefixCls: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls } = defineProps<PanelArrowProps>();
</script>
<template>
  <svg :class="`${prefixCls}-panel-arrow`" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <title>Arrow</title>
    <path d="M 0 0 L 100 50 L 0 100" />
  </svg>
</template>
