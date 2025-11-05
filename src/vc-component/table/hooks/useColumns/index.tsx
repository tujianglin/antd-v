import { isValidNode } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import type { ReactiveComputedReturn } from '@vueuse/core';
import { isEqual } from 'lodash-es';
import { computed, ref, toRefs, type ComputedRef, type VNode } from 'vue';
import { EXPAND_COLUMN } from '../../constant';
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  Direction,
  FixedType,
  GetRowKey,
  Key,
  RenderExpandIcon,
  TriggerEventHandler,
} from '../../interface';
import { INTERNAL_COL_DEFINE } from '../../utils/legacyUtil';
import useWidthColumns from './useWidthColumns';

export function convertChildrenToColumns<RecordType>(children: VNode[]): ColumnsType<RecordType> {
  return (children as any[])
    .filter((node) => isValidNode(node))
    .map((node) => {
      const { key, props } = node;
      const { children: nodeChildren, ...restProps } = props;
      const column = {
        key,
        ...restProps,
      };

      if (nodeChildren) {
        column.children = convertChildrenToColumns(nodeChildren);
      }

      return column;
    });
}

function filterHiddenColumns<RecordType>(columns: ColumnsType<RecordType>): ColumnsType<RecordType> {
  return columns
    .filter((column) => column && typeof column === 'object' && !column.hidden)
    .map((column) => {
      const subColumns = (column as ColumnGroupType<RecordType>).children;

      if (subColumns && subColumns.length > 0) {
        return {
          ...column,
          children: filterHiddenColumns(subColumns),
        };
      }

      return column;
    });
}

function flatColumns<RecordType>(columns: ColumnsType<RecordType>, parentKey = 'key'): ColumnType<RecordType>[] {
  return columns
    .filter((column) => column && typeof column === 'object')
    .reduce((list, column, index) => {
      const { fixed } = column;
      const parsedFixed = fixed === true || fixed === 'left' ? 'start' : fixed === 'right' ? 'end' : fixed;
      const mergedKey = `${parentKey}-${index}`;

      const subColumns = (column as ColumnGroupType<RecordType>).children;
      if (subColumns && subColumns.length > 0) {
        return [
          ...list,
          ...flatColumns(subColumns, mergedKey).map((subColum) => ({
            ...subColum,
            fixed: subColum.fixed ?? parsedFixed,
          })),
        ];
      }
      return [
        ...list,
        {
          key: mergedKey,
          ...column,
          fixed: parsedFixed,
        },
      ];
    }, []);
}

interface ColumnsInfo<RecordType = any> {
  prefixCls?: string;
  columns?: ColumnsType<RecordType>;
  children?: VNode[];
  expandable: boolean;
  expandedKeys: Set<Key>;
  columnTitle?: VueNode;
  getRowKey: GetRowKey<RecordType>;
  onTriggerExpand: TriggerEventHandler<RecordType>;
  expandIcon?: RenderExpandIcon<RecordType>;
  rowExpandable?: (record: RecordType) => boolean;
  direction?: Direction;
  expandRowByClick?: boolean;
  columnWidth?: number | string;
  clientWidth: number;
  fixed?: FixedType;
  scrollWidth?: number;
  expandedRowOffset?: number;
}

/**
 * Parse `columns` & `children` into `columns`.
 */
function useColumns<RecordType>(
  props: ReactiveComputedReturn<ColumnsInfo>,
  transformColumns: (columns: ColumnsType<RecordType>) => ColumnsType<RecordType>,
): [
  columns: ComputedRef<ColumnsType<RecordType>>,
  flattenColumns: ComputedRef<ColumnType<any>[]>,
  realScrollWidth: ComputedRef<undefined | number>,
] {
  const {
    prefixCls,
    columns,
    children,
    expandable,
    expandedKeys,
    columnTitle,
    getRowKey,
    onTriggerExpand,
    expandIcon,
    rowExpandable,
    expandedRowOffset = ref(0),
    direction,
    expandRowByClick,
    columnWidth,
    fixed,
    scrollWidth,
    clientWidth,
  } = toRefs(props);

  const baseColumns = computed<ColumnsType<RecordType>>(() => {
    const newColumns = columns?.value || convertChildrenToColumns(children.value) || [];

    return filterHiddenColumns(newColumns.slice());
  });

  // ========================== Expand ==========================
  const withExpandColumns = computed<ColumnsType<RecordType>>(() => {
    direction.value;
    if (expandable.value) {
      let cloneColumns = baseColumns.value.slice();
      const flag = cloneColumns.some((col) => isEqual(col, EXPAND_COLUMN));
      // >>> Insert expand column if not exist
      if (!flag) {
        const expandColIndex = 0;
        const insertIndex =
          expandColIndex === 0 && (fixed?.value === 'right' || fixed?.value === 'end')
            ? baseColumns.value.length
            : expandColIndex;
        if (insertIndex >= 0) {
          cloneColumns.splice(insertIndex, 0, EXPAND_COLUMN);
        }
      }

      const expandColumnIndex = cloneColumns.findIndex((col) => isEqual(col, EXPAND_COLUMN));
      cloneColumns = cloneColumns.filter((column, index) => column !== EXPAND_COLUMN || index === expandColumnIndex);

      // >>> Check if expand column need to fixed
      const prevColumn = baseColumns.value[expandColumnIndex];

      let fixedColumn: FixedType | null;
      if (fixed?.value) {
        fixedColumn = fixed?.value;
      } else {
        fixedColumn = prevColumn ? prevColumn.fixed : null;
      }

      // >>> Create expandable column
      const expandColumn = {
        [INTERNAL_COL_DEFINE]: {
          class: `${prefixCls.value}-expand-icon-col`,
          columnType: 'EXPAND_COLUMN',
        },
        title: columnTitle.value,
        fixed: fixedColumn,
        class: `${prefixCls.value}-row-expand-icon-cell`,
        width: columnWidth?.value,
        render: (_, record, index) => {
          const rowKey = getRowKey.value(record, index);
          const expanded = expandedKeys.value.has(rowKey);
          const recordExpandable = rowExpandable?.value ? rowExpandable.value(record) : true;

          const icon = expandIcon.value({
            prefixCls: prefixCls.value,
            expanded,
            expandable: recordExpandable,
            record,
            onExpand: onTriggerExpand?.value,
          });

          if (expandRowByClick?.value) {
            return <span onClick={(e) => e.stopPropagation()}>{icon}</span>;
          }
          return icon;
        },
      };

      return cloneColumns.map((col, index) => {
        const column = isEqual(col, EXPAND_COLUMN) ? expandColumn : col;
        if (index < expandedRowOffset.value) {
          return {
            ...column,
            fixed: column.fixed || 'start',
          };
        }
        return column;
      });
    }

    return baseColumns.value.filter((col) => !isEqual(col, EXPAND_COLUMN));
  });

  // ========================= Transform ========================
  const mergedColumns = computed(() => {
    direction.value;
    let finalColumns = withExpandColumns.value;
    if (transformColumns) {
      finalColumns = transformColumns(finalColumns);
    }

    // Always provides at least one column for table display
    if (!finalColumns.length) {
      finalColumns = [
        {
          render: () => null,
        },
      ];
    }
    return finalColumns;
  });

  // ========================== Flatten =========================
  const flattenColumns = computed(() => flatColumns(mergedColumns?.value));

  // ========================= FillWidth ========================
  const widthColumnsProps = useWidthColumns(flattenColumns, scrollWidth, clientWidth);

  return [mergedColumns, computed(() => widthColumnsProps.value?.[0]), computed(() => widthColumnsProps.value?.[1])];
}

export default useColumns;
