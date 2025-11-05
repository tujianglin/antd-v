<script lang="tsx" setup>
import type { VueKey } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, ref, toRefs, watch, type CSSProperties } from 'vue';
import Cell from '../Cell/index.vue';
import type { TableProps } from '../Table.vue';
import useRowInfo from '../hooks/useRowInfo';
import type { CustomizeComponent } from '../interface';
import { computedExpandedClassName } from '../utils/expandUtil';
import ExpandedRow from './ExpandedRow.vue';
import { getCellProps } from './util';

export interface BodyRowProps<RecordType = any> {
  record: RecordType;
  index: number;
  renderIndex: number;
  class?: string;
  style?: CSSProperties;
  classNames: TableProps['classNames']['body'];
  styles: TableProps['styles']['body'];
  rowComponent: CustomizeComponent;
  cellComponent: CustomizeComponent;
  scopeCellComponent: CustomizeComponent;
  indent?: number;
  rowKey: VueKey | undefined;
  rowKeys: VueKey[];

  // Expanded Row
  expandedRowInfo?: {
    offset: number;
    colspan: number;
    sticky: number;
  };
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  class: className,
  style,
  classNames,
  styles,
  record,
  index,
  renderIndex,
  rowKey,
  rowKeys,
  indent = 0,
  rowComponent: RowComponent,
  cellComponent,
  scopeCellComponent,
  expandedRowInfo,
} = defineProps<BodyRowProps>();

const rowInfo = useRowInfo(
  computed(() => record),
  computed(() => rowKey),
  computed(() => index),
  computed(() => indent),
);
const {
  prefixCls,
  flattenColumns,
  expandedRowClassName,
  expandedRowRender,
  rowProps,

  // Misc
  expanded,
  rowSupportExpand,
} = toRefs(rowInfo);

// Force render expand row if expanded before
const expandedRef = ref(false);
watch(expanded, () => {
  expandedRef.value = expanded?.value;
});

// 若没有 expandedRowRender 参数, 将使用 baseRowNode 渲染 Children
// 此时如果 level > 1 则说明是 expandedRow, 一样需要附加 computedExpandedRowClassName
const expandedClsName = computed(() => computedExpandedClassName(expandedRowClassName.value, record, index, indent));

const columnData = (column, colIndex) => {
  return getCellProps(rowInfo as any, column, colIndex, indent, index, rowKeys, expandedRowInfo?.offset);
};
</script>
<template>
  <component
    :is="RowComponent"
    v-bind="rowProps"
    :data-row-key="rowKey"
    :class="
      clsx(className, `${prefixCls}-row`, `${prefixCls}-row-level-${indent}`, rowProps?.class, classNames.row, {
        [expandedClsName]: indent >= 1,
      })
    "
    :style="{
      ...style,
      ...rowProps?.style,
      ...styles.row,
    }"
  >
    <Cell
      v-for="(column, colIndex) in flattenColumns"
      :class="clsx(column.class, classNames.cell)"
      :style="styles.cell"
      :ellipsis="column.ellipsis"
      :align="column.align"
      :component="column.rowScope ? scopeCellComponent : cellComponent"
      :prefix-cls="prefixCls"
      :key="columnData(column, colIndex).key"
      :record="record"
      :index="index"
      :render-index="renderIndex"
      :data-index="column.dataIndex"
      :render="column.render"
      :should-cell-update="column.shouldCellUpdate"
      v-bind="columnData(column, colIndex).fixedInfo"
      :append-node="columnData(column, colIndex).appendCellNode"
      :additional-props="columnData(column, colIndex).additionalCellProps"
    />
  </component>
  <ExpandedRow
    v-if="rowSupportExpand && (expandedRef || expanded)"
    expanded
    :class="clsx(`${prefixCls}-expanded-row`, `${prefixCls}-expanded-row-level-${indent + 1}`, expandedClsName)"
    :prefix-cls="prefixCls"
    :component="RowComponent"
    :cell-component="cellComponent"
    :colspan="expandedRowInfo ? expandedRowInfo.colspan : flattenColumns.length"
    :is-empty="false"
    :sticky-offset="expandedRowInfo?.sticky"
  >
    <component :is="() => expandedRowRender(record, index, indent + 1, expanded)" />
  </ExpandedRow>
</template>
