<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { TabNavListProps } from './index.vue';
import TabNavList from './index.vue';

export type TabNavListWrapperProps = Required<Omit<TabNavListProps, 'class'>> & TabNavListProps;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { renderTabBar, ...restProps } = defineProps<TabNavListWrapperProps>();
</script>
<template>
  <template v-if="renderTabBar">
    <Render :content="renderTabBar(restProps, TabNavList)" />
  </template>
  <TabNavList v-else v-bind="restProps" />
</template>
