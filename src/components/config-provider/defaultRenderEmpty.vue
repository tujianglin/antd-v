<script lang="tsx" setup>
import { toRefs, type VNode } from 'vue';
import Empty from '../empty';
import { useConfigContextInject } from './context';

export type RenderEmptyHandler = (componentName?: ComponentName) => VNode;

type ComponentName =
  | 'Table'
  | 'Table.filter' /* 👈 5.20.0+ */
  | 'List'
  | 'Select'
  | 'TreeSelect'
  | 'Cascader'
  | 'Transfer'
  | 'Mentions';
interface EmptyProps {
  componentName?: ComponentName;
}

const { componentName } = defineProps<EmptyProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());

const prefix = getPrefixCls.value('empty');
</script>
<template>
  <template v-if="componentName === 'Table' || componentName === 'List'">
    <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
  </template>
  <template v-else-if="['Select', 'TreeSelect', 'Cascader', 'Transfer', 'Mentions'].includes(componentName)">
    <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" :class="`${prefix}-small`" />
  </template>
  <template v-else-if="componentName === 'Table.filter'"></template>
  <template v-else>
    <Empty />
  </template>
</template>
