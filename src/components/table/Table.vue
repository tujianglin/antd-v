<script lang="tsx" setup>
import { convertChildrenToColumns } from '@/vc-component/table/hooks/useColumns';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import { computed, useTemplateRef, type VNode } from 'vue';
import type { ColumnsType, TableProps } from './InternalTable.vue';
import InternalTable from './InternalTable.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const props = withDefaults(defineProps<TableProps>(), {
  showHeader: true,
  rowHoverable: true,
  pagination: undefined,
  rowSelection: undefined,
  showSorterTooltip: undefined,
});

const slots = defineSlots<{
  default: () => VNode[];
  title: () => VNode[];
  footer: () => VNode[];
}>();

const baseColumns = computed(
  () => props.columns || (convertChildrenToColumns(flattenChildren(slots.default?.())) as ColumnsType),
);

const title = computed(() => slots.title || props.title);
const footer = computed(() => slots.footer || props.footer);

const tableRef = useTemplateRef('tableRef');

defineExpose({
  scrollTo: (config) => {
    tableRef.value.scrollTo(config);
  },
});
</script>
<template>
  <InternalTable ref="tableRef" v-bind="$props" :columns="baseColumns" :title="title" :footer="footer" />
</template>
