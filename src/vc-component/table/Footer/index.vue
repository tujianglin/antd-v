<script lang="tsx" setup>
import { computed } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import type { ColumnType, StickyOffsets } from '../interface';
import { SummaryContextProvider } from './SummaryContext';

type FlattenColumns<RecordType> = (ColumnType<RecordType> & { scrollbar?: boolean })[];

export interface FooterProps<RecordType> {
  stickyOffsets: StickyOffsets;
  flattenColumns: FlattenColumns<RecordType>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { stickyOffsets, flattenColumns } = defineProps<FooterProps<any>>();

const { prefixCls } = useTableContextInject();

const lastColumnIndex = computed(() => flattenColumns.length - 1);
const scrollColumn = computed(() => flattenColumns[lastColumnIndex.value]);

const summaryContext = computed(() => ({
  stickyOffsets,
  flattenColumns,
  scrollColumnIndex: scrollColumn?.value?.scrollbar ? lastColumnIndex.value : null,
}));
</script>
<template>
  <SummaryContextProvider :value="summaryContext">
    <tfoot :class="`${prefixCls}-summary`">
      <slot></slot>
    </tfoot>
  </SummaryContextProvider>
</template>
