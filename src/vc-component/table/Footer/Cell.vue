<script setup lang="tsx">
import { computed, toRefs } from 'vue';
import Cell from '../Cell/index.vue';
import { useTableContextInject } from '../context/TableContext';
import type { AlignType } from '../interface';
import { getCellFixedInfo } from '../utils/fixUtil';
import { useSummaryContextInject } from './SummaryContext';

export interface SummaryCellProps {
  class?: string;
  index: number;
  colspan?: number;
  rowspan?: number;
  align?: AlignType;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, index, colspan = 1, rowspan, align } = defineProps<SummaryCellProps>();
const { prefixCls } = toRefs(useTableContextInject());
const { scrollColumnIndex, stickyOffsets, flattenColumns } = toRefs(useSummaryContextInject());
const lastIndex = computed(() => index + colspan - 1);
const mergedColSpan = computed(() => (lastIndex.value + 1 === scrollColumnIndex.value ? colspan + 1 : colspan));

const fixedInfo = computed(() =>
  getCellFixedInfo(index, index + mergedColSpan.value - 1, flattenColumns.value, stickyOffsets.value),
);
</script>

<template>
  <Cell
    :class="className"
    :index="index"
    component="td"
    :prefix-cls="prefixCls"
    :record="null"
    :data-index="null"
    :align="align"
    :colspan="mergedColSpan"
    :rowspan="rowspan"
    :render="() => $slots.default"
    v-bind="fixedInfo"
  >
    <slot></slot>
  </Cell>
</template>
