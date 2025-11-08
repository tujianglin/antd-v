import type { ReactiveComputedReturn } from '@vueuse/core';
import { computed, ref, toRefs, type Ref } from 'vue';
import { devUseWarning } from '../../../_util/warning';
import type {
  ColumnsType,
  ColumnTitleProps,
  ColumnType,
  FilterKey,
  FilterValue,
  GetPopupContainer,
  Key,
  SafeKey,
  TableLocale,
  TransformColumns,
} from '../../interface';
import { getColumnKey, getColumnPos, renderColumnTitle } from '../../util';
import FilterDropdown from './FilterDropdown.vue';
import { flattenKeys } from './util';

export interface FilterState {
  column: ColumnType;
  key: Key;
  filteredKeys?: FilterKey;
  forceFiltered?: boolean;
}

const collectFilterStates = (columns: ColumnsType, init: boolean, pos?: string): FilterState[] => {
  let filterStates: FilterState[] = [];

  (columns || []).forEach((column, index) => {
    const columnPos = getColumnPos(index, pos);
    const filterDropdownIsDefined = column.filterDropdown !== undefined;

    if (column.filters || filterDropdownIsDefined || 'onFilter' in column) {
      if ('filteredValue' in column) {
        // Controlled
        let filteredValues = column.filteredValue;
        if (!filterDropdownIsDefined) {
          filteredValues = filteredValues?.map(String) ?? filteredValues;
        }
        filterStates.push({
          column,
          key: getColumnKey(column, columnPos),
          filteredKeys: filteredValues as FilterKey,
          forceFiltered: column.filtered,
        });
      } else {
        // Uncontrolled
        filterStates.push({
          column,
          key: getColumnKey(column, columnPos),
          filteredKeys: (init && column.defaultFilteredValue ? column.defaultFilteredValue! : undefined) as FilterKey,
          forceFiltered: column.filtered,
        });
      }
    }

    if ('children' in column) {
      filterStates = [...filterStates, ...collectFilterStates(column.children, init, columnPos)];
    }
  });

  return filterStates;
};

function injectFilter(
  prefixCls: string,
  dropdownPrefixCls: string,
  columns: ColumnsType,
  filterStates: FilterState[],
  locale: TableLocale,
  triggerFilter: (filterState: FilterState) => void,
  getPopupContainer?: GetPopupContainer,
  pos?: string,
  rootClassName?: string,
): ColumnsType {
  return columns.map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    const { filterOnClose = true, filterMultiple = true, filterMode, filterSearch } = column as ColumnType;

    let newColumn: ColumnsType[number] = column;

    if (newColumn.filters || newColumn.filterDropdown) {
      const columnKey = getColumnKey(newColumn, columnPos);
      const filterState = filterStates.find(({ key }) => columnKey === key);

      newColumn = {
        ...newColumn,
        title: (renderProps: ColumnTitleProps) => (
          <FilterDropdown
            tablePrefixCls={prefixCls}
            prefixCls={`${prefixCls}-filter`}
            dropdownPrefixCls={dropdownPrefixCls}
            column={newColumn}
            columnKey={columnKey}
            filterState={filterState}
            filterOnClose={filterOnClose}
            filterMultiple={filterMultiple}
            filterMode={filterMode}
            filterSearch={filterSearch}
            triggerFilter={triggerFilter}
            locale={locale}
            getPopupContainer={getPopupContainer}
            rootClassName={rootClassName}
          >
            {renderColumnTitle(column.title, renderProps)}
          </FilterDropdown>
        ),
      };
    }

    if ('children' in newColumn) {
      newColumn = {
        ...newColumn,
        children: injectFilter(
          prefixCls,
          dropdownPrefixCls,
          newColumn.children,
          filterStates,
          locale,
          triggerFilter,
          getPopupContainer,
          columnPos,
          rootClassName,
        ),
      };
    }

    return newColumn;
  });
}

const generateFilterInfo = (filterStates: FilterState[]) => {
  const currentFilters: Record<string, FilterValue | null> = {};

  filterStates.forEach(({ key, filteredKeys, column }) => {
    const keyAsString = key as SafeKey;
    const { filters, filterDropdown } = column;
    if (filterDropdown) {
      currentFilters[keyAsString] = filteredKeys || null;
    } else if (Array.isArray(filteredKeys)) {
      const keys = flattenKeys(filters);
      currentFilters[keyAsString] = keys.filter((originKey) => filteredKeys.includes(String(originKey)));
    } else {
      currentFilters[keyAsString] = null;
    }
  });

  return currentFilters;
};

export const getFilterData = (data, filterStates: FilterState[], childrenColumnName: string) => {
  const filterDatas = filterStates.reduce((currentData, filterState) => {
    const {
      column: { onFilter, filters },
      filteredKeys,
    } = filterState;
    if (onFilter && filteredKeys && filteredKeys.length) {
      return (
        currentData
          // shallow copy
          .map((record) => ({ ...record }))
          .filter((record: any) =>
            filteredKeys.some((key) => {
              const keys = flattenKeys(filters);
              const keyIndex = keys.findIndex((k) => String(k) === String(key));
              const realKey = keyIndex !== -1 ? keys[keyIndex] : key;

              // filter children
              if (record[childrenColumnName]) {
                record[childrenColumnName] = getFilterData(record[childrenColumnName], filterStates, childrenColumnName);
              }

              return onFilter(realKey, record);
            }),
          )
      );
    }
    return currentData;
  }, data);
  return filterDatas;
};

export interface FilterConfig {
  prefixCls: string;
  dropdownPrefixCls: string;
  mergedColumns: ColumnsType;
  locale: TableLocale;
  onFilterChange: (filters: Record<string, FilterValue | null>, filterStates: FilterState[]) => void;
  getPopupContainer?: GetPopupContainer;
  rootClassName?: string;
}

const getMergedColumns = (rawMergedColumns: ColumnsType): ColumnsType =>
  rawMergedColumns.flatMap((column) => {
    if ('children' in column) {
      return [column, ...getMergedColumns(column.children || [])];
    }
    return [column];
  });

const useFilter = (
  props: ReactiveComputedReturn<FilterConfig>,
): [TransformColumns, Ref<FilterState[]>, Ref<Record<string, FilterValue | null>>] => {
  const {
    prefixCls,
    dropdownPrefixCls,
    mergedColumns: rawMergedColumns,
    onFilterChange,
    getPopupContainer,
    locale: tableLocale,
    rootClassName,
  } = toRefs(props as FilterConfig);
  const warning = devUseWarning('Table');

  const mergedColumns = computed(() => getMergedColumns(rawMergedColumns.value || []));

  const filterStates = ref<FilterState[]>(collectFilterStates(mergedColumns.value, true));

  const mergedFilterStates = computed(() => {
    const collectedStates = collectFilterStates(mergedColumns.value, false);
    if (collectedStates.length === 0) {
      return collectedStates as any;
    }
    let filteredKeysIsAllNotControlled = true;
    let filteredKeysIsAllControlled = true;
    collectedStates.forEach(({ filteredKeys }) => {
      if (filteredKeys !== undefined) {
        filteredKeysIsAllNotControlled = false;
      } else {
        filteredKeysIsAllControlled = false;
      }
    });

    // Return if not controlled
    if (filteredKeysIsAllNotControlled) {
      // Filter column may have been removed
      const keyList = (mergedColumns.value || []).map((column, index) => getColumnKey(column, getColumnPos(index)));
      return filterStates.value
        .filter(({ key }) => keyList.includes(key))
        .map((item) => {
          const col = mergedColumns.value[keyList.indexOf(item.key)];
          return {
            ...item,
            column: {
              ...item.column,
              ...col,
            },
            forceFiltered: col.filtered,
          };
        });
    }

    warning(filteredKeysIsAllControlled, 'usage', 'Columns should all contain `filteredValue` or not contain `filteredValue`.');

    return collectedStates as any;
  });

  const filters = computed(() => generateFilterInfo(mergedFilterStates.value));

  const triggerFilter = (filterState: FilterState) => {
    const newFilterStates = mergedFilterStates.value.filter(({ key }) => key !== filterState.key);
    newFilterStates.push(filterState);
    filterStates.value = newFilterStates;
    onFilterChange.value(generateFilterInfo(newFilterStates), newFilterStates);
  };

  const transformColumns = (innerColumns: ColumnsType) =>
    injectFilter(
      prefixCls.value,
      dropdownPrefixCls.value,
      innerColumns,
      mergedFilterStates.value,
      tableLocale.value,
      triggerFilter,
      getPopupContainer.value,
      undefined,
      rootClassName.value,
    );

  return [transformColumns, mergedFilterStates, filters] as const;
};

export { flattenKeys };

export default useFilter;
