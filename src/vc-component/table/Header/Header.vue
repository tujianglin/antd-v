<script lang="tsx" setup>
import clsx from 'clsx';
import { computed } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import type { CellType, ColumnGroupType, ColumnsType, ColumnType, GetComponentProps, StickyOffsets } from '../interface';
import type { TableProps } from '../Table.vue';
import HeaderRow from './HeaderRow.vue';

export interface HeaderProps<RecordType> {
  columns: ColumnsType<RecordType>;
  flattenColumns: ColumnType<RecordType>[];
  stickyOffsets: StickyOffsets;
  onHeaderRow?: GetComponentProps<ColumnType<RecordType>[]> | undefined;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { stickyOffsets, columns, flattenColumns, onHeaderRow } = defineProps<HeaderProps<any>>();

function parseHeaderRows<RecordType>(
  rootColumns: ColumnsType<RecordType>,
  classNames: TableProps['classNames']['header'],
  styles: TableProps['styles']['header'],
): CellType<RecordType>[][] {
  const rows: CellType<RecordType>[][] = [];

  function fillRowCells(columns: ColumnsType<RecordType>, colIndex: number, rowIndex: number = 0): number[] {
    // Init rows
    rows[rowIndex] = rows[rowIndex] || [];

    let currentColIndex = colIndex;
    const colSpans: number[] = columns.filter(Boolean).map((column) => {
      const cell: CellType<RecordType> = {
        key: column.key,
        class: clsx(column.class, classNames.cell) || '',
        style: styles.cell,
        children: column.title,
        column,
        colStart: currentColIndex,
      };

      let colspan: number = 1;

      const subColumns = (column as ColumnGroupType<RecordType>).children;
      if (subColumns && subColumns.length > 0) {
        colspan = fillRowCells(subColumns, currentColIndex, rowIndex + 1).reduce((total, count) => total + count, 0);
        cell.hasSubColumns = true;
      }

      if ('colspan' in column) {
        ({ colspan } = column);
      }

      if ('rowspan' in column) {
        cell.rowspan = column.rowspan;
      }

      cell.colspan = colspan;
      cell.colEnd = cell.colStart + colspan - 1;
      rows[rowIndex].push(cell);

      currentColIndex += colspan;

      return colspan;
    });

    return colSpans;
  }

  // Generate `rows` cell data
  fillRowCells(rootColumns, 0);

  // Handle `rowspan`
  const rowCount = rows.length;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows[rowIndex].forEach((cell) => {
      if (!('rowspan' in cell) && !cell.hasSubColumns) {
        cell.rowspan = rowCount - rowIndex;
      }
    });
  }
  return rows;
}

const { prefixCls, getComponent, classNames, styles } = useTableContextInject();

const headerCls = computed(() => (classNames?.value || {}) as TableProps['classNames']['header']);
const headerStyles = computed(() => (styles?.value || {}) as TableProps['styles']['header']);
const rows = computed<CellType<any>[][]>(() => parseHeaderRows(columns, headerCls.value, headerStyles.value));

const WrapperComponent = getComponent.value(['header', 'wrapper'], 'thead');
const trComponent = getComponent.value(['header', 'row'], 'tr');
const thComponent = getComponent.value(['header', 'cell'], 'th');
</script>
<template>
  <WrapperComponent :class="clsx(`${prefixCls}-thead`, headerCls.wrapper)" :style="headerStyles.wrapper">
    <HeaderRow
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      :class-names="headerCls"
      :styles="headerStyles"
      :flatten-columns="flattenColumns"
      :cells="row"
      :sticky-offsets="stickyOffsets"
      :row-component="trComponent"
      :cell-component="thComponent"
      @header-row="onHeaderRow"
      :index="rowIndex"
    />
  </WrapperComponent>
</template>
