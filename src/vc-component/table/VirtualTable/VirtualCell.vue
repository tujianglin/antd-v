<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties, type TdHTMLAttributes } from 'vue';
import { getCellProps, getColumnWidth } from '../Body/util';
import Cell from '../Cell/index.vue';
import type useRowInfo from '../hooks/useRowInfo';
import type { ColumnType, CustomizeComponent } from '../interface';
import { useGridContextInject } from './context';

export interface VirtualCellProps<RecordType> {
  rowInfo: ReturnType<typeof useRowInfo<RecordType>>;
  column: ColumnType<RecordType>;
  colIndex: number;
  indent: number;
  index: number;
  component?: CustomizeComponent;
  /** Used for `column.render` */
  renderIndex: number;
  record: RecordType;

  // Follow props is used for RowSpanVirtualCell only
  style?: CSSProperties;
  class?: string;

  /** Render cell only when it has `rowSpan > 1` */
  inverse?: boolean;
  getHeight?: (rowSpan: number) => number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rowInfo,
  column,
  colIndex,
  indent,
  index,
  component,
  renderIndex,
  record,
  style,
  class: className,
  inverse,
  getHeight,
} = defineProps<VirtualCellProps<any>>();

const { render, dataIndex, class: columnClassName, width: colWidth } = toRefs(reactiveComputed(() => column));

const { columnsOffset } = toRefs(useGridContextInject());

// TODO: support `expandableRowOffset`
const { key, fixedInfo, appendCellNode, additionalCellProps } = toRefs(
  reactiveComputed(() => getCellProps(rowInfo as any, column, colIndex, indent, index)),
);

const cellStyle = computed(() => (additionalCellProps.value as any).style);
const colspan = computed(() => (additionalCellProps.value.colspan as number) || 1);
const rowspan = computed(() => (additionalCellProps.value.rowspan as number) || 1);
// ========================= ColWidth =========================

// column width
const startColIndex = computed(() => colIndex - 1);
const concatColWidth = computed(() => getColumnWidth(startColIndex.value, colspan.value, columnsOffset.value));

// margin offset
const marginOffset = computed(() => (colspan.value > 1 ? (colWidth.value as number) - concatColWidth.value : 0));

// When `colSpan` or `rowSpan` is `0`, should skip render.
const needHide = computed(() => {
  if (inverse) {
    return rowspan.value <= 1;
  } else {
    return colspan.value === 0 || rowspan.value === 0 || rowspan.value > 1;
  }
});

// ========================== Style ===========================
const mergedStyle = computed(() => {
  const result: CSSProperties = {
    ...cellStyle.value,
    ...style,
    flex: `0 0 ${concatColWidth.value}px`,
    width: `${concatColWidth.value}px`,
    marginRight: `${marginOffset.value}px`,
    pointerEvents: 'auto',
  };

  // 0 rowSpan or colSpan should not render
  if (needHide.value) {
    result.visibility = 'hidden';
  } else if (inverse) {
    result.height = getHeight?.(rowspan.value);
  }
  return result;
});
const mergedRender = computed(() => (needHide.value ? () => null : render?.value));

// ========================== Render ==========================
const cellSpan = computed(() => {
  const result: TdHTMLAttributes = {};
  // Virtual should reset `colSpan` & `rowSpan`
  if (rowspan.value === 0 || colspan.value === 0) {
    result.rowspan = 1;
    result.rowspan = 1;
  }
  return result;
});
</script>
<template>
  <Cell
    :class="clsx(columnClassName, className)"
    :ellipsis="column.ellipsis"
    :align="column.align"
    :scope="column.rowScope"
    :component="component"
    :prefix-cls="rowInfo.prefixCls"
    :key="key"
    :record="record"
    :index="index"
    :render-index="renderIndex"
    :data-index="dataIndex"
    :render="mergedRender"
    :style="mergedStyle"
    v-bind="fixedInfo"
    :append-node="appendCellNode"
    :additional-props="{
      ...additionalCellProps,
      style: mergedStyle,
      ...cellSpan,
    }"
  />
</template>
