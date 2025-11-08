import clsx from 'clsx';

import KeyCode from '@/vc-util/KeyCode';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue';
import type { ReactiveComputedReturn } from '@vueuse/core';
import { computed, ref, toRefs, type HTMLAttributes, type Ref } from 'vue';
import type { Locale } from '../../locale';
import type { TooltipProps } from '../../tooltip';
import Tooltip from '../../tooltip';
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnTitleProps,
  ColumnType,
  CompareFn,
  Key,
  SorterResult,
  SorterTooltipProps,
  SortOrder,
  TableLocale,
  TransformColumns,
} from '../interface';
import { getColumnKey, getColumnPos, renderColumnTitle, safeColumnTitle } from '../util';

const ASCEND = 'ascend';
const DESCEND = 'descend';

const getMultiplePriority = (column: ColumnType): number | false => {
  if (typeof column.sorter === 'object' && typeof column.sorter.multiple === 'number') {
    return column.sorter.multiple;
  }
  return false;
};

const getSortFunction = (sorter: ColumnType['sorter']): CompareFn | false => {
  if (typeof sorter === 'function') {
    return sorter;
  }
  if (sorter && typeof sorter === 'object' && sorter.compare) {
    return sorter.compare;
  }
  return false;
};

const nextSortDirection = (sortDirections: SortOrder[], current: SortOrder | null) => {
  if (!current) {
    return sortDirections[0];
  }
  return sortDirections[sortDirections.indexOf(current) + 1];
};

export interface SortState {
  column: ColumnType;
  key: Key;
  sortOrder: SortOrder | null;
  multiplePriority: number | false;
}

const collectSortStates = (columns: ColumnsType, init: boolean, pos?: string): SortState[] => {
  let sortStates: SortState[] = [];

  const pushState = (column: ColumnsType[number], columnPos: string) => {
    sortStates.push({
      column,
      key: getColumnKey(column, columnPos),
      multiplePriority: getMultiplePriority(column),
      sortOrder: column.sortOrder!,
    });
  };

  (columns || []).forEach((column, index) => {
    const columnPos = getColumnPos(index, pos);
    if ((column as ColumnGroupType).children) {
      if ('sortOrder' in column) {
        // Controlled
        pushState(column, columnPos);
      }
      sortStates = [...sortStates, ...collectSortStates((column as ColumnGroupType).children, init, columnPos)];
    } else if (column.sorter) {
      if ('sortOrder' in column) {
        // Controlled
        pushState(column, columnPos);
      } else if (init && column.defaultSortOrder) {
        // Default sorter
        sortStates.push({
          column,
          key: getColumnKey(column, columnPos),
          multiplePriority: getMultiplePriority(column),
          sortOrder: column.defaultSortOrder!,
        });
      }
    }
  });

  return sortStates;
};

const injectSorter = (
  prefixCls: string,
  columns: ColumnsType,
  sorterStates: SortState[],
  triggerSorter: (sorterSates: SortState) => void,
  defaultSortDirections: SortOrder[],
  tableLocale?: TableLocale,
  tableShowSorterTooltip?: boolean | SorterTooltipProps,
  pos?: string,
  a11yLocale?: Locale['global'],
): ColumnsType => {
  const finalColumns = (columns || []).map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    let newColumn: ColumnsType[number] = column;
    if (newColumn.sorter) {
      const sortDirections: SortOrder[] = newColumn.sortDirections || defaultSortDirections;
      const showSorterTooltip = newColumn.showSorterTooltip === undefined ? tableShowSorterTooltip : newColumn.showSorterTooltip;

      const columnKey = getColumnKey(newColumn, columnPos);
      const sorterState = sorterStates.find(({ key }) => key === columnKey);
      const sortOrder = sorterState ? sorterState.sortOrder : null;
      const nextSortOrder = nextSortDirection(sortDirections, sortOrder);

      let sorter;
      if (column.sortIcon) {
        sorter = column.sortIcon({ sortOrder });
      } else {
        const upNode = sortDirections.includes(ASCEND) && (
          <CaretUpOutlined class={clsx(`${prefixCls}-column-sorter-up`, { active: sortOrder === ASCEND })} />
        );
        const downNode = sortDirections.includes(DESCEND) && (
          <CaretDownOutlined class={clsx(`${prefixCls}-column-sorter-down`, { active: sortOrder === DESCEND })} />
        );
        sorter = (
          <span
            class={clsx(`${prefixCls}-column-sorter`, {
              [`${prefixCls}-column-sorter-full`]: !!(upNode && downNode),
            })}
          >
            <span class={`${prefixCls}-column-sorter-inner`} aria-hidden="true">
              {upNode}
              {downNode}
            </span>
          </span>
        );
      }

      const { cancelSort, triggerAsc, triggerDesc } = tableLocale || {};
      let sortTip: string | undefined = cancelSort;
      if (nextSortOrder === DESCEND) {
        sortTip = triggerDesc;
      } else if (nextSortOrder === ASCEND) {
        sortTip = triggerAsc;
      }
      const tooltipProps: TooltipProps =
        typeof showSorterTooltip === 'object'
          ? {
              title: sortTip,
              ...showSorterTooltip,
            }
          : { title: sortTip };
      newColumn = {
        ...newColumn,
        class: clsx(newColumn.class, { [`${prefixCls}-column-sort`]: sortOrder }),
        title: (renderProps: ColumnTitleProps) => {
          const columnSortersClass = `${prefixCls}-column-sorters`;
          const renderColumnTitleWrapper = (
            <span class={`${prefixCls}-column-title`}>{renderColumnTitle(column.title, renderProps)}</span>
          );
          const renderSortTitle = (
            <div class={columnSortersClass}>
              {renderColumnTitleWrapper}
              {sorter}
            </div>
          );
          if (showSorterTooltip) {
            if (typeof showSorterTooltip !== 'boolean' && showSorterTooltip?.target === 'sorter-icon') {
              return (
                <div class={clsx(columnSortersClass, `${columnSortersClass}-tooltip-target-sorter`)}>
                  {renderColumnTitleWrapper}
                  <Tooltip {...tooltipProps}>{sorter}</Tooltip>
                </div>
              );
            }
            return <Tooltip {...tooltipProps}>{renderSortTitle}</Tooltip>;
          }
          return renderSortTitle;
        },
        onHeaderCell: (col) => {
          const cell: HTMLAttributes = column.onHeaderCell?.(col) || {};
          const originOnClick = cell.onClick;
          const originOKeyDown = cell.onKeydown;
          cell.onClick = (event) => {
            triggerSorter({
              column,
              key: columnKey,
              sortOrder: nextSortOrder,
              multiplePriority: getMultiplePriority(column),
            });
            originOnClick?.(event);
          };
          cell.onKeydown = (event: KeyboardEvent) => {
            if (event.keyCode === KeyCode.ENTER) {
              triggerSorter({
                column,
                key: columnKey,
                sortOrder: nextSortOrder,
                multiplePriority: getMultiplePriority(column),
              });
              originOKeyDown?.(event);
            }
          };

          const renderTitle = safeColumnTitle(column.title, {});
          const displayTitle = renderTitle?.toString();

          // Inform the screen-reader so it can tell the visually impaired user which column is sorted
          if (sortOrder) {
            cell['aria-sort'] = sortOrder === 'ascend' ? 'ascending' : 'descending';
          }
          // Inform the screen-reader so it can tell the visually impaired user that this column can be sorted
          cell['aria-description'] = a11yLocale?.sortable;
          cell['aria-label'] = displayTitle || '';
          cell.class = clsx(cell.class, `${prefixCls}-column-has-sorters`);
          cell.tabindex = 0;
          if (column.ellipsis) {
            cell.title = (renderTitle ?? '').toString();
          }
          return cell;
        },
      };
    }

    if ('children' in newColumn) {
      newColumn = {
        ...newColumn,
        children: injectSorter(
          prefixCls,
          newColumn.children,
          sorterStates,
          triggerSorter,
          defaultSortDirections,
          tableLocale,
          tableShowSorterTooltip,
          columnPos,
          a11yLocale,
        ),
      };
    }

    return newColumn;
  });
  return finalColumns;
};

const stateToInfo = (sorterState: SortState): SorterResult => {
  const { column, sortOrder } = sorterState;
  return {
    column,
    order: sortOrder,
    field: column.dataIndex as SorterResult['field'],
    columnKey: column.key,
  };
};

const generateSorterInfo = (sorterStates: SortState[]): SorterResult | SorterResult[] => {
  const activeSorters = sorterStates.filter(({ sortOrder }) => sortOrder).map<SorterResult>(stateToInfo);

  // =========== Legacy compatible support ===========
  // https://github.com/ant-design/ant-design/pull/19226
  if (activeSorters.length === 0 && sorterStates.length) {
    const lastIndex = sorterStates.length - 1;
    return {
      ...stateToInfo(sorterStates[lastIndex]),
      column: undefined,
      order: undefined,
      field: undefined,
      columnKey: undefined,
    };
  }

  if (activeSorters.length <= 1) {
    return activeSorters[0] || {};
  }

  return activeSorters;
};

export const getSortData = (data: any[], sortStates: SortState[], childrenColumnName: string) => {
  const innerSorterStates = sortStates.slice().sort((a, b) => (b.multiplePriority as number) - (a.multiplePriority as number));

  const cloneData = data.slice();

  const runningSorters = innerSorterStates.filter(({ column: { sorter }, sortOrder }) => getSortFunction(sorter) && sortOrder);

  // Skip if no sorter needed
  if (!runningSorters.length) {
    return cloneData;
  }

  return cloneData
    .sort((record1, record2) => {
      for (let i = 0; i < runningSorters.length; i += 1) {
        const sorterState = runningSorters[i];
        const {
          column: { sorter },
          sortOrder,
        } = sorterState;

        const compareFn = getSortFunction(sorter);

        if (compareFn && sortOrder) {
          const compareResult = compareFn(record1, record2, sortOrder);

          if (compareResult !== 0) {
            return sortOrder === ASCEND ? compareResult : -compareResult;
          }
        }
      }

      return 0;
    })
    .map((record) => {
      const subRecords = record[childrenColumnName];
      if (subRecords) {
        return {
          ...record,
          [childrenColumnName]: getSortData(subRecords, sortStates, childrenColumnName),
        };
      }
      return record;
    });
};

interface SorterConfig {
  prefixCls: string;
  mergedColumns: ColumnsType;
  onSorterChange: (sorterResult: SorterResult | SorterResult[], sortStates: SortState[]) => void;
  sortDirections: SortOrder[];
  tableLocale?: TableLocale;
  showSorterTooltip?: boolean | SorterTooltipProps;
  globalLocale?: Locale['global'];
}

const useFilterSorter = (
  props: ReactiveComputedReturn<SorterConfig>,
): [TransformColumns, Ref<SortState[]>, Ref<ColumnTitleProps>, () => SorterResult | SorterResult[]] => {
  const { prefixCls, mergedColumns, sortDirections, tableLocale, showSorterTooltip, onSorterChange, globalLocale } = toRefs(
    props as SorterConfig,
  );

  const sortStates = ref<SortState[]>(collectSortStates(mergedColumns.value, true));

  const getColumnKeys = (columns: ColumnsType, pos?: string): Key[] => {
    const newKeys: Key[] = [];
    columns.forEach((item, index) => {
      const columnPos = getColumnPos(index, pos);
      newKeys.push(getColumnKey(item, columnPos));
      if (Array.isArray((item as ColumnGroupType).children)) {
        const childKeys = getColumnKeys((item as ColumnGroupType).children, columnPos);
        newKeys.push(...childKeys);
      }
    });
    return newKeys;
  };
  const mergedSorterStates = computed<SortState[]>(() => {
    let validate = true;
    const collectedStates = collectSortStates(mergedColumns.value, false);

    // Return if not controlled
    if (!collectedStates.length) {
      const mergedColumnsKeys = getColumnKeys(mergedColumns.value);
      return sortStates.value.filter(({ key }) => mergedColumnsKeys.includes(key)) as SortState[];
    }

    const validateStates: SortState[] = [];

    function patchStates(state: SortState) {
      if (validate) {
        validateStates.push(state);
      } else {
        validateStates.push({
          ...state,
          sortOrder: null,
        });
      }
    }

    let multipleMode: boolean | null = null;
    collectedStates.forEach((state) => {
      if (multipleMode === null) {
        patchStates(state);

        if (state.sortOrder) {
          if (state.multiplePriority === false) {
            validate = false;
          } else {
            multipleMode = true;
          }
        }
      } else if (multipleMode && state.multiplePriority !== false) {
        patchStates(state);
      } else {
        validate = false;
        patchStates(state);
      }
    });

    return validateStates as SortState[];
  });

  // Get render columns title required props
  const columnTitleSorterProps = computed<ColumnTitleProps>(() => {
    const sortColumns = mergedSorterStates.value.map(({ column, sortOrder }) => ({
      column,
      order: sortOrder,
    }));

    return {
      sortColumns,
      // Legacy
      sortColumn: sortColumns[0]?.column,
      sortOrder: sortColumns[0]?.order,
    };
  });

  const triggerSorter = (sortState: SortState) => {
    let newSorterStates: SortState[];
    if (
      sortState.multiplePriority === false ||
      !mergedSorterStates.value.length ||
      mergedSorterStates.value[0].multiplePriority === false
    ) {
      newSorterStates = [sortState];
    } else {
      newSorterStates = [...mergedSorterStates.value.filter(({ key }) => key !== sortState.key), sortState];
    }
    sortStates.value = newSorterStates;
    onSorterChange.value(generateSorterInfo(newSorterStates), newSorterStates);
  };

  const transformColumns = (innerColumns: ColumnsType) =>
    injectSorter(
      prefixCls.value,
      innerColumns,
      mergedSorterStates.value,
      triggerSorter,
      sortDirections.value,
      tableLocale.value,
      showSorterTooltip.value,
      undefined,
      globalLocale.value,
    );

  const getSorters = () => generateSorterInfo(mergedSorterStates.value);

  return [transformColumns, mergedSorterStates, columnTitleSorterProps, getSorters] as const;
};

export default useFilterSorter;
