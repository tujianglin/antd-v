<script lang="tsx" setup>
import { INTERNAL_HOOKS, type TableProps as RcTableProps } from '@/vc-component/table';
import type { AnyObject } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import { computed, getCurrentInstance, ref, toRefs, useTemplateRef } from 'vue';
import {
  useMergeSemantic,
  type SemanticClassNames,
  type SemanticClassNamesType,
  type SemanticStyles,
  type SemanticStylesType,
} from '../_util/hooks/index';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import type { SemanticName as PaginationSemanticType } from '../pagination/Pagination.vue';
import Spin, { type SpinProps } from '../spin';
import { useToken } from '../theme/internal';
import renderExpandIcon from './ExpandIcon';
import useContainerWidth from './hooks/useContainerWidth';
import useFilter, { getFilterData, type FilterConfig, type FilterState } from './hooks/useFilter';
import useLazyKVMap from './hooks/useLazyKVMap';
import usePagination, { DEFAULT_PAGE_SIZE, getPaginationParam } from './hooks/usePagination';
import useSelection from './hooks/useSelection';
import useSorter, { getSortData, type SortState } from './hooks/useSorter';
import useTitleColumns from './hooks/useTitleColumns';
import type {
  ColumnsType,
  ColumnTitleProps,
  ColumnType,
  ExpandableConfig,
  ExpandType,
  FilterValue,
  GetPopupContainer,
  GetRowKey,
  SorterResult,
  SorterTooltipProps,
  SortOrder,
  TableAction,
  TableCurrentDataSource,
  TableLocale,
  TablePaginationConfig,
  TablePaginationPlacement,
  TablePaginationPosition,
  TableRowSelection,
} from './interface';
import useStyle from './style';
import Pagination from '../pagination/Pagination.vue';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty.vue';
import RcTable from './RcTable';
import RcVirtualTable from './RcTable/VirtualTable';
import scrollTo from '../_util/scrollTo';
import type { Breakpoint } from '../_util/responsiveObserver';

export type { ColumnsType, TablePaginationConfig };

export type TableSemanticName = 'section' | 'title' | 'footer' | 'content' | 'root';

export type ComponentsSemantic = 'wrapper' | 'cell' | 'row';

export type TableClassNamesType<RecordType = AnyObject> = SemanticClassNamesType<
  TableProps<RecordType>,
  TableSemanticName,
  {
    body?: SemanticClassNames<ComponentsSemantic>;
    header?: SemanticClassNames<ComponentsSemantic>;
    pagination?: SemanticClassNames<PaginationSemanticType>;
  }
>;

export type TableStylesType<RecordType = AnyObject> = SemanticStylesType<
  TableProps<RecordType>,
  TableSemanticName,
  {
    body?: SemanticStyles<ComponentsSemantic>;
    header?: SemanticStyles<ComponentsSemantic>;
    pagination?: SemanticStyles<PaginationSemanticType>;
  }
>;

interface ChangeEventInfo<RecordType = AnyObject> {
  pagination: {
    current?: number;
    pageSize?: number;
    total?: number;
  };
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<RecordType> | SorterResult<RecordType>[];

  filterStates: FilterState[];
  sorterStates: SortState[];

  resetPagination: (current?: number, pageSize?: number) => void;
}

export interface TableProps<RecordType = any>
  extends Omit<
    RcTableProps<RecordType>,
    'transformColumns' | 'internalHooks' | 'internalRefs' | 'data' | 'columns' | 'scroll' | 'emptyText' | 'classNames' | 'styles'
  > {
  classNames?: TableClassNamesType<RecordType>;
  styles?: TableStylesType<RecordType>;
  dropdownPrefixCls?: string;
  dataSource?: RcTableProps<RecordType>['data'];
  columns?: ColumnsType<RecordType>;
  pagination?: false | TablePaginationConfig;
  loading?: boolean | SpinProps;
  size?: SizeType;
  bordered?: boolean;
  locale?: TableLocale;
  rootClassName?: string;

  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    extra: TableCurrentDataSource<RecordType>,
  ) => void;
  rowSelection?: TableRowSelection<RecordType>;

  getPopupContainer?: GetPopupContainer;
  scroll?: RcTableProps<RecordType>['scroll'] & {
    scrollToFirstRowOnChange?: boolean;
  };
  sortDirections?: SortOrder[];
  showSorterTooltip?: boolean | SorterTooltipProps;
  virtual?: boolean;
}
defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  classNames,
  styles,
  size: customizeSize,
  bordered,
  dropdownPrefixCls: customizeDropdownPrefixCls,
  dataSource,
  pagination = undefined,
  rowSelection = undefined,
  rowKey: customizeRowKey,
  rowClassName,
  columns,
  onChange,
  getPopupContainer,
  loading,
  expandable,
  indentSize,
  scroll,
  sortDirections,
  locale,
  // eslint-disable-next-line vue/require-valid-default-prop
  showSorterTooltip = { target: 'full-header' },
  virtual,
  showHeader = true,
  rowHoverable = true,
} = defineProps<TableProps<any>>();

const baseColumns = computed(() => columns);
const needResponsive = computed(() => baseColumns.value.some((col: ColumnType) => col.responsive));

const screens = useBreakpoint(needResponsive);

const mergedColumns = computed(() => {
  const matched = new Set(Object.keys(screens.value).filter((m) => screens.value[m as Breakpoint]));

  return baseColumns.value.filter((c) => !c.responsive || c.responsive.some((r) => matched.has(r)));
});

const vm = getCurrentInstance();
const tableProps = computed<TableProps>(() => omit(vm.props, ['className', 'style', 'columns']));

const { locale: ctxLocale, table } = toRefs(useConfigContextInject());

const contextLocale = computed(() => ctxLocale?.value || defaultLocale);

const {
  getPrefixCls,
  direction,
  renderEmpty,
  getPopupContainer: getContextPopupContainer,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('table'));

const mergedSize = useSize(computed(() => customizeSize));

// =========== Merged Props for Semantic ==========
const [mergedClassNames, mergedStyles] = useMergeSemantic<TableClassNamesType, TableStylesType, TableProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
      bordered,
    },
  })),
  computed(() => ({
    pagination: {
      _default: 'root',
    },
    header: {
      _default: 'wrapper',
    },
    body: {
      _default: 'wrapper',
    },
  })),
);

const EMPTY_LIST: AnyObject[] = [];

const tableLocale = computed<TableLocale>(() => ({ ...contextLocale.value.Table, ...locale }));
const [globalLocale] = useLocale('global', defaultLocale.global);
const rawData = computed(() => dataSource || EMPTY_LIST);

const prefixCls = computed(() => getPrefixCls.value('table', customizePrefixCls));
const dropdownPrefixCls = computed(() => getPrefixCls.value('dropdown', customizeDropdownPrefixCls));

const [, token] = useToken();
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

// ========================== Expandable ==========================
const mergedExpandable = computed<ExpandableConfig<any>>(() => {
  const result: ExpandableConfig<any> = {
    ...expandable,
    expandIcon: expandable?.expandIcon ?? table?.value?.expandable?.expandIcon,
  };
  // Pass origin render status into `@rc-component/table`, this can be removed when refactor with `@rc-component/table`
  (result as any).__PARENT_RENDER_ICON__ = result.expandIcon;

  // Customize expandable icon
  result.expandIcon = result.expandIcon || renderExpandIcon(tableLocale.value!);

  // Indent size
  if (typeof result.indentSize !== 'number') {
    result.indentSize = typeof indentSize === 'number' ? indentSize : 15;
  }
  return result;
});

const childrenColumnName = computed(() => mergedExpandable.value?.childrenColumnName || 'children');

const expandType = computed<ExpandType>(() => {
  if (rawData.value.some((item) => item?.[childrenColumnName.value])) {
    return 'nest';
  }

  if (expandable?.expandedRowRender) {
    return 'row';
  }

  return null;
});

const internalRefs = {
  body: ref<HTMLDivElement>(null),
};

// ============================ Width =============================
const getContainerWidth = useContainerWidth(prefixCls);

// ============================= Refs =============================
const rootRef = useTemplateRef('rootRef');
const tblRef = useTemplateRef('tblRef');

defineExpose({
  get nativeElement() {
    return rootRef.value!;
  },
  scrollTo: (config) => {
    tblRef.value?.scrollTo(config);
  },
});

// ============================ RowKey ============================
const rowKey = computed(() => customizeRowKey || table?.value?.rowKey || 'key');

const getRowKey = computed<GetRowKey>(() => {
  if (typeof rowKey.value === 'function') {
    return rowKey.value;
  }

  return (record) => record?.[rowKey.value as string];
});

const [getRecordByKey] = useLazyKVMap(rawData, childrenColumnName, getRowKey);

const triggerOnChange = (info: Partial<ChangeEventInfo>, action: TableAction, reset = false) => {
  const changeInfo = {
    // eslint-disable-next-line no-use-before-define
    ...changeEventInfo,
    ...info,
  };

  if (reset) {
    // eslint-disable-next-line no-use-before-define
    changeEventInfo.resetPagination?.();

    // Reset event param
    if (changeInfo.pagination?.current) {
      changeInfo.pagination.current = 1;
    }

    // Trigger pagination events
    if (pagination) {
      pagination.onChange?.(1, changeInfo.pagination?.pageSize!);
    }
  }

  if (scroll && scroll.scrollToFirstRowOnChange !== false && internalRefs.body.value) {
    scrollTo(0, {
      getContainer: () => internalRefs.body.value,
    });
  }

  onChange?.(changeInfo.pagination!, changeInfo.filters!, changeInfo.sorter!, {
    currentDataSource: getFilterData(
      getSortData(rawData.value, changeInfo.sorterStates!, childrenColumnName.value),
      changeInfo.filterStates!,
      childrenColumnName.value,
    ),
    action,
  });
};

/**
 * Controlled state in `columns` is not a good idea that makes too many code (1000+ line?) to read
 * state out and then put it back to title render. Move these code into `hooks` but still too
 * complex. We should provides Table props like `sorter` & `filter` to handle control in next big
 * version.
 */

// ============================ Sorter =============================
const onSorterChange = (sorter: SorterResult | SorterResult[], sorterStates: SortState[]) => {
  triggerOnChange(
    {
      sorter,
      sorterStates,
    },
    'sort',
    false,
  );
};
const [transformSorterColumns, sortStates, sorterTitleProps, getSorters] = useSorter(
  reactiveComputed(() => ({
    prefixCls: prefixCls.value,
    mergedColumns: mergedColumns.value,
    onSorterChange,
    sortDirections: sortDirections || ['ascend', 'descend'],
    tableLocale: tableLocale.value,
    showSorterTooltip,
    globalLocale: globalLocale.value,
  })),
);

const sortedData = computed(() => getSortData(rawData.value, sortStates.value, childrenColumnName.value));

// ============================ Filter ============================
const onFilterChange: FilterConfig['onFilterChange'] = (filters, filterStates) => {
  triggerOnChange({ filters, filterStates }, 'filter', true);
};

const [transformFilterColumns, filterStates, filters] = useFilter(
  reactiveComputed(() => ({
    prefixCls: prefixCls.value,
    locale: tableLocale.value,
    dropdownPrefixCls: dropdownPrefixCls.value,
    mergedColumns: mergedColumns.value,
    onFilterChange,
    getPopupContainer: getPopupContainer || getContextPopupContainer.value,
    rootClassName: clsx(rootClassName, rootCls.value),
  })),
);
const mergedData = computed(() => getFilterData(sortedData.value, filterStates.value, childrenColumnName.value));

// ============================ Column ============================
const columnTitleProps = computed<ColumnTitleProps>(() => {
  const mergedFilters: Record<string, FilterValue> = {};
  Object.keys(filters.value).forEach((filterKey) => {
    if (filters.value[filterKey] !== null) {
      mergedFilters[filterKey] = filters.value[filterKey]!;
    }
  });
  return {
    ...sorterTitleProps.value,
    filters: mergedFilters,
  };
});

const [transformTitleColumns] = useTitleColumns(columnTitleProps);

// ========================== Pagination ==========================
const onPaginationChange = (current: number, pageSize: number) => {
  triggerOnChange(
    {
      // eslint-disable-next-line no-use-before-define
      pagination: { ...changeEventInfo.pagination, current, pageSize },
    },
    'paginate',
  );
};

const [mergedPagination, resetPagination] = usePagination(
  computed(() => mergedData.value.length),
  onPaginationChange,
  computed(() => pagination),
);

// ============================ Events =============================
const changeEventInfo = reactiveComputed<Partial<ChangeEventInfo>>(() => ({
  sorter: getSorters(),
  sorterStates: sortStates.value,
  filters: filters.value,
  filterStates: filterStates.value,
  pagination: pagination === false ? {} : getPaginationParam(mergedPagination.value, pagination),
  resetPagination,
}));

// ============================= Data =============================
const pageData = computed(() => {
  if (pagination === false || !mergedPagination.value.pageSize) {
    return mergedData.value;
  }

  const { current = 1, total, pageSize = DEFAULT_PAGE_SIZE } = mergedPagination.value;

  // Dynamic table data
  if (mergedData.value.length < total!) {
    if (mergedData.value.length > pageSize) {
      return mergedData.value.slice((current - 1) * pageSize, current * pageSize);
    }
    return mergedData.value;
  }

  return mergedData.value.slice((current - 1) * pageSize, current * pageSize);
});

// ========================== Selections ==========================
const [transformSelectionColumns, selectedKeySet] = useSelection(
  reactiveComputed(() => ({
    prefixCls: prefixCls.value,
    data: mergedData.value,
    pageData: pageData.value,
    getRowKey: getRowKey.value,
    getRecordByKey,
    expandType: expandType.value,
    childrenColumnName: childrenColumnName.value,
    locale: tableLocale.value,
    getPopupContainer: getPopupContainer || getContextPopupContainer.value,
  })),
  computed(() => rowSelection),
);

const internalRowClassName = (record, index: number, indent: number) => {
  const resolvedRowClassName = typeof rowClassName === 'function' ? rowClassName(record, index, indent) : rowClassName;
  return clsx(
    {
      [`${prefixCls.value}-row-selected`]: selectedKeySet.value.has(getRowKey.value(record, index)),
    },
    resolvedRowClassName,
  );
};

// ============================ Render ============================
const transformColumns = (innerColumns: ColumnsType): ColumnsType => {
  return transformTitleColumns(transformSelectionColumns(transformFilterColumns(transformSorterColumns(innerColumns))));
};

const { topPaginationNode, bottomPaginationNode } = toRefs(
  reactiveComputed(() => {
    let topPaginationNode;
    let bottomPaginationNode;
    if (pagination !== false && mergedPagination.value?.total) {
      let paginationSize: TablePaginationConfig['size'];
      if (mergedPagination.value.size) {
        paginationSize = mergedPagination.value.size;
      } else {
        paginationSize = mergedSize.value === 'small' || mergedSize.value === 'middle' ? 'small' : undefined;
      }
      const renderPagination = (placement: 'start' | 'end' | 'center' = 'end') => (
        <Pagination
          {...mergedPagination.value}
          classNames={mergedClassNames.value.pagination}
          styles={mergedStyles.value.pagination}
          class={clsx(`${prefixCls.value}-pagination ${prefixCls.value}-pagination-${placement}`, mergedPagination.value.class)}
          size={paginationSize}
        />
      );

      const { position } = mergedPagination.value;
      const normalizePlacement = (pos: TablePaginationPlacement | TablePaginationPosition) => {
        const lowerPos = pos.toLowerCase();
        if (lowerPos.includes('center')) {
          return 'center';
        }
        return lowerPos.includes('left') || lowerPos.includes('start') ? 'start' : 'end';
      };
      if (Array.isArray(position)) {
        const [topPos, bottomPos] = ['top', 'bottom'].map((dir) => position.find((p) => p.includes(dir)));
        const isDisable = position.every((p) => `${p}` === 'none');
        if (!topPos && !bottomPos && !isDisable) {
          bottomPaginationNode = renderPagination();
        }
        if (topPos) {
          topPaginationNode = renderPagination(normalizePlacement(topPos));
        }
        if (bottomPos) {
          bottomPaginationNode = renderPagination(normalizePlacement(bottomPos));
        }
      } else {
        bottomPaginationNode = renderPagination();
      }
    }
    return { topPaginationNode, bottomPaginationNode };
  }),
);

// >>>>>>>>> Spinning
const spinProps = computed<SpinProps | undefined>(() => {
  if (typeof loading === 'boolean') {
    return { spinning: loading };
  } else if (typeof loading === 'object' && loading !== null) {
    return { spinning: true, ...loading };
  } else {
    return undefined;
  }
});

const wrappercls = computed(() =>
  clsx(
    cssVarCls.value,
    rootCls.value,
    `${prefixCls.value}-wrapper`,
    contextClassName,
    {
      [`${prefixCls.value}-wrapper-rtl`]: direction.value === 'rtl',
    },
    className,
    rootClassName,
    mergedClassNames.value.root,
    hashId.value,
  ),
);

const mergedStyle = computed(() => ({ ...mergedStyles.value.root, ...contextStyle?.value, ...style }));

// ========== empty ==========
const mergedEmptyNode = computed<RcTableProps['emptyText']>(() => {
  // When dataSource is null/undefined (detected by reference equality with EMPTY_LIST),
  // and the table is in a loading state, we only show the loading spinner without the empty placeholder.
  // For empty arrays (datasource={[]}), both loading and empty states would normally be shown.
  // discussion https://github.com/ant-design/ant-design/issues/54601#issuecomment-3158091383
  if (spinProps.value?.spinning && rawData.value === EMPTY_LIST) {
    return null;
  }
  if (typeof locale?.emptyText !== 'undefined') {
    return locale.emptyText;
  }
  return renderEmpty.value?.('Table') || <DefaultRenderEmpty componentName="Table" />;
});

// ========================== Render ==========================
const TableComponent = computed(() => (virtual ? RcVirtualTable : RcTable));

const listItemHeight = computed(() => {
  const { fontSize, lineHeight, lineWidth, padding, paddingXS, paddingSM } = token.value;
  const fontHeight = Math.floor(fontSize * lineHeight);

  switch (mergedSize.value) {
    case 'middle':
      return paddingSM * 2 + fontHeight + lineWidth;

    case 'small':
      return paddingXS * 2 + fontHeight + lineWidth;

    default:
      return padding * 2 + fontHeight + lineWidth;
  }
});

// >>> Virtual Table props. We set height here since it will affect height collection
const virtualProps = computed(() => {
  const result: { listItemHeight?: number } = {};
  if (virtual) {
    result.listItemHeight = listItemHeight.value;
  }
  return result;
});
</script>
<template>
  <div ref="rootRef" :class="wrappercls" :style="mergedStyle">
    <Spin :spinning="false" v-bind="spinProps">
      <component :is="topPaginationNode" />
      <component
        :is="TableComponent"
        v-bind="{ ...virtualProps, ...tableProps }"
        :show-header="showHeader"
        :row-hoverable="rowHoverable"
        :class-names="mergedClassNames"
        :styles="mergedStyles"
        ref="tblRef"
        :columns="mergedColumns"
        :direction="direction"
        :expandable="mergedExpandable"
        :prefix-cls="prefixCls"
        :class="
          clsx(
            {
              [`${prefixCls}-middle`]: mergedSize === 'middle',
              [`${prefixCls}-small`]: mergedSize === 'small',
              [`${prefixCls}-bordered`]: bordered,
              [`${prefixCls}-empty`]: rawData.length === 0,
            },
            cssVarCls,
            rootCls,
            hashId,
          )
        "
        :data="pageData"
        :row-key="getRowKey"
        :row-class-name="internalRowClassName"
        :empty-text="mergedEmptyNode"
        :internal-hooks="INTERNAL_HOOKS"
        :internal-refs="internalRefs"
        :transform-columns="transformColumns"
        :get-container-width="getContainerWidth"
      />
      <component :is="bottomPaginationNode" />
    </Spin>
  </div>
</template>
