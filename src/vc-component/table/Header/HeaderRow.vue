<script lang="tsx" setup>
import { computed, toRefs } from 'vue';
import Cell from '../Cell/index.vue';
import { useTableContextInject } from '../context/TableContext';
import type { CellType, ColumnType, CustomizeComponent, GetComponentProps, StickyOffsets } from '../interface';
import type { TableProps } from '../Table.vue';
import { getCellFixedInfo } from '../utils/fixUtil';
import { getColumnsKey } from '../utils/valueUtil';

export interface RowProps<RecordType = any> {
  cells: CellType<RecordType>[];
  stickyOffsets: StickyOffsets;
  flattenColumns: ColumnType<RecordType>[];
  rowComponent: CustomizeComponent;
  cellComponent: CustomizeComponent;
  onHeaderRow: GetComponentProps<ColumnType<RecordType>[]> | undefined;
  index: number;
  classNames: TableProps['classNames']['header'];
  styles: TableProps['styles']['header'];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const {
  cells,
  stickyOffsets,
  flattenColumns,
  rowComponent: RowComponent,
  cellComponent: CellComponent,
  onHeaderRow,
  index,
  classNames,
  styles,
} = defineProps<RowProps>();

const { prefixCls } = toRefs(useTableContextInject());

const rowProps = computed(() => {
  let result;
  if (onHeaderRow) {
    result = onHeaderRow(
      cells.map((cell) => cell.column),
      index,
    );
  }
  return result;
});

const columnsKey = computed(() => getColumnsKey(cells.map((cell) => cell.column)));
</script>
<template>
  <component :is="RowComponent" v-bind="rowProps" :class="classNames.row" :style="styles.row">
    <Cell
      v-for="(cell, cellIndex) in cells"
      v-bind="{ ...cell, ...getCellFixedInfo(cell.colStart, cell.colEnd, flattenColumns, stickyOffsets) }"
      :key="columnsKey[cellIndex]"
      :scope="cell.column.title ? (cell.colspan > 1 ? 'colgroup' : 'col') : null"
      :ellipsis="cell.column.ellipsis"
      :align="cell.column.align"
      :component="CellComponent"
      :prefix-cls="prefixCls"
      :additional-props="cell.column?.onHeaderCell?.(cell.column) || {}"
      row-type="header"
    />
  </component>
</template>
