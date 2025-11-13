<script lang="tsx" setup>
import type { TabPaneProps as RcTabPaneProps } from '@/vc-component/tabs/TabPanelList/TabPane.vue';

export type TabPaneProps = Omit<RcTabPaneProps, 'destroyInactiveTabPane'>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<TabPaneProps>();
</script>
<template>
  <slot></slot>
</template>
