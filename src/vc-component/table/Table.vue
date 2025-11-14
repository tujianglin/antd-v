<!-- eslint-disable vue/define-macros-order -->
<script lang="tsx" setup>
import { isValidElement } from '@/vc-util/Children/util';
import { getDOM } from '@/vc-util/Dom/findDOMNode';
import { getTargetScrollBarSize } from '@/vc-util/getScrollBarSize';
import type { VueKey, VueNode } from '@/vc-util/type';
import getValue from '@/vc-util/utils/get';
import { reactiveComputed } from '@vueuse/core';
import { isEqual } from 'es-toolkit/compat';
import {
  computed,
  getCurrentInstance,
  markRaw,
  nextTick,
  onMounted,
  ref,
  toRefs,
  watch,
  watchEffect,
  type CSSProperties,
  type Ref,
  type VNode,
} from 'vue';
import { INTERNAL_HOOKS } from './constant';
import { TableContextProvider, type ScrollInfoType } from './context/TableContext';
import Summary, { type SummaryProps } from './Footer/Summary.vue';
import useColumns from './hooks/useColumns';
import useExpand from './hooks/useExpand';
import { useTimeoutLock } from './hooks/useFrame';
import useHover from './hooks/useHover';
import useSticky from './hooks/useSticky';
import useStickyOffsets from './hooks/useStickyOffsets';
import {
  DEFAULT_PREFIX,
  type ColumnsType,
  type ColumnType,
  type CustomizeScrollBody,
  type Direction,
  type ExpandableConfig,
  type GetComponent,
  type GetComponentProps,
  type GetRowKey,
  type LegacyExpandableProps,
  type PanelRender,
  type RowClassName,
  type TableComponents,
  type TableLayout,
  type TableSticky,
} from './interface';
import { getColumnsKey, validateValue, validNumberValue } from './utils/valueUtil';
import Header from './Header/Header.vue';
import Footer from './Footer/index.vue';
import Body from './Body/index.vue';
import ColGroup from './ColGroup.vue';
import pickAttrs from '@/vc-util/pickAttrs';
import FixedHolder from './FixedHolder/index.vue';
import StickyScrollBar from './stickyScrollBar.vue';
import clsx from 'clsx';
import Panel from './Panel/index.vue';
import ResizeObserver from '@/vc-component/resize-observer';
import useFixedInfo from './hooks/useFixedInfo';
import { toPx } from '@/vc-util/setStyle';

export type SemanticName = 'section' | 'title' | 'footer' | 'content';
export type ComponentsSemantic = 'wrapper' | 'cell' | 'row';

export interface TableProps<RecordType = any> extends Omit<LegacyExpandableProps<RecordType>, 'showExpandColumn'> {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<SemanticName, string>> & {
    body?: Partial<Record<ComponentsSemantic, string>>;
    header?: Partial<Record<ComponentsSemantic, string>>;
  };
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    body?: Partial<Record<ComponentsSemantic, CSSProperties>>;
    header?: Partial<Record<ComponentsSemantic, CSSProperties>>;
  };
  data?: RecordType[];
  columns?: ColumnsType<RecordType>;
  rowKey?: string | keyof RecordType | GetRowKey<RecordType>;
  tableLayout?: TableLayout;

  // Fixed Columns
  scroll?: { x?: number | true | string; y?: number | string };

  // Expandable
  /** Config expand rows */
  expandable?: ExpandableConfig<RecordType>;
  indentSize?: number;
  rowClassName?: string | RowClassName<RecordType>;

  // Additional Part
  footer?: PanelRender<RecordType>;
  summary?: (data: RecordType[]) => VueNode;
  caption?: VueNode;

  // Customize
  id?: string;
  showHeader?: boolean;
  components?: TableComponents<RecordType>;
  onRow?: GetComponentProps<RecordType>;
  onHeaderRow?: GetComponentProps<ColumnType<RecordType>[]>;
  emptyText?: VueNode | (() => VueNode);

  direction?: Direction;

  sticky?: boolean | TableSticky;

  rowHoverable?: boolean;

  // Events
  onScroll?: (e: UIEvent) => void;

  // =================================== Internal ===================================
  /**
   * @private Internal usage, may remove by refactor. Should always use `columns` instead.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  internalHooks?: string;

  /**
   * @private Internal usage, may remove by refactor. Should always use `columns` instead.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  // Used for antd table transform column with additional column
  transformColumns?: (columns: ColumnsType<RecordType>) => ColumnsType<RecordType>;

  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  // Force trade scrollbar as 0 size.
  // Force column to be average width if not set
  tailor?: boolean;

  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  // Pass the way to get real width. e.g. exclude the border width
  getContainerWidth?: (ele: HTMLElement, width: number) => number;

  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  internalRefs?: {
    body: Ref<HTMLElement>;
  };
  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  measureRowRender?: (measureRow: VueNode) => VueNode;
}

const defaultEmpty = 'No Data';

// Used for conditions cache
const EMPTY_DATA = [];

// Used for customize scroll
const EMPTY_SCROLL_TARGET = {};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = DEFAULT_PREFIX,
  class: className,
  rowClassName,
  style,
  classNames,
  styles,
  data,
  rowKey = 'key',
  scroll,
  tableLayout,
  direction,

  // Additional Part
  title,
  footer,
  summary,
  caption,

  // Customize
  id,
  showHeader = undefined,
  components,
  emptyText = defaultEmpty,
  onRow,
  onHeaderRow,

  // Measure Row
  measureRowRender,

  // Events
  onScroll,

  // Internal
  internalHooks,
  transformColumns,
  tailor,
  getContainerWidth,

  sticky,
  rowHoverable = true,
  internalRefs,
} = defineProps<TableProps>();

const slots = defineSlots<{
  default: () => VNode[];
}>();

const mergedData = computed(() => data || EMPTY_DATA);
const hasData = computed(() => !!mergedData.value.length);

const useInternalHooks = computed(() => internalHooks === INTERNAL_HOOKS);

// ==================== Customize =====================
const getComponent: GetComponent = (path, defaultComponent) => getValue(components, path) || defaultComponent;

const getRowKey = computed(() => {
  if (typeof rowKey === 'function') {
    return rowKey;
  }
  return (record) => {
    const key = record && record[rowKey];

    return key;
  };
});

const customizeScrollBody = getComponent(['body']) as CustomizeScrollBody<any>;

// ====================== Hover =======================
const [startRow, endRow, onHover] = useHover();

// ====================== Expand ======================
const vm = getCurrentInstance();
const [expandableConfig, expandableType, mergedExpandedKeys, mergedExpandIcon, mergedChildrenColumnName, onTriggerExpand] =
  useExpand(vm.props, mergedData, getRowKey);

// ====================== Column ======================
const scrollX = computed(() => scroll?.x);
const componentWidth = ref(0);

const [columns, flattenColumns, flattenScrollX] = useColumns(
  reactiveComputed(() => ({
    ...vm.props,
    ...expandableConfig,
    children: slots.default?.(),
    expandable: !!expandableConfig.expandedRowRender,
    columnTitle: expandableConfig.columnTitle,
    expandedKeys: mergedExpandedKeys.value,
    getRowKey: getRowKey.value,
    // https://github.com/ant-design/ant-design/issues/23894
    onTriggerExpand,
    expandIcon: mergedExpandIcon.value,
    direction,
    scrollWidth: useInternalHooks.value && tailor && typeof scrollX.value === 'number' ? scrollX.value : null,
    clientWidth: componentWidth.value,
  })),
  computed(() => (useInternalHooks.value ? transformColumns : null)),
);

const mergedScrollX = computed(() => flattenScrollX.value ?? scrollX.value);

const columnContext = computed(() => ({ columns: columns.value, flattenColumns: flattenColumns.value }));

// ======================= Refs =======================
const fullTableRef = ref<HTMLDivElement>(null);
const scrollHeaderRef = ref<HTMLDivElement>(null);
const scrollBodyRef = ref<HTMLDivElement>(null);
const scrollBodyContainerRef = ref<HTMLDivElement>(null);

defineExpose({
  get nativeElement() {
    return fullTableRef.value;
  },
  scrollTo: (config) => {
    if (scrollBodyRef.value instanceof HTMLElement) {
      // Native scroll
      const { index, top, key, offset } = config;

      if (validNumberValue(top)) {
        // In top mode, offset is ignored
        scrollBodyRef.value?.scrollTo({ top });
      } else {
        const mergedKey = key ?? getRowKey.value(mergedData.value[index]);
        const targetElement = scrollBodyRef.value.querySelector(`[data-row-key="${mergedKey}"]`);
        if (targetElement) {
          if (!offset) {
            // No offset, use scrollIntoView for default behavior
            targetElement.scrollIntoView();
          } else {
            // With offset, use element's offsetTop + offset
            const elementTop = (targetElement as HTMLElement).offsetTop;
            scrollBodyRef.value.scrollTo({ top: elementTop + offset });
          }
        }
      }
    } else if ((scrollBodyRef.value as any)?.scrollTo) {
      // Pass to proxy
      (scrollBodyRef.value as any).scrollTo(config);
    }
  },
});

// ====================== Scroll ======================
const scrollSummaryRef = ref<HTMLDivElement>(null);
const shadowStart = ref(false);
const shadowEnd = ref(false);
const colsWidths = ref(new Map<VueKey, number>());

// Convert map to number width
const colsKeys = computed(() => getColumnsKey(flattenColumns.value));
const pureColWidths = computed(() => colsKeys.value.map((columnKey) => colsWidths.value.get(columnKey)));
const colWidths = computed(() => pureColWidths.value);
const stickyOffsets = useStickyOffsets(colWidths, flattenColumns);
const fixHeader = computed(() => scroll && validateValue(scroll.y));
const horizonScroll = computed(() => (scroll && validateValue(mergedScrollX)) || Boolean(expandableConfig.fixed));
const fixColumn = computed(() => horizonScroll.value && flattenColumns.value.some(({ fixed }) => fixed));

// Sticky
const stickyRef = ref<{
  setScrollLeft: (left: number) => void;
  checkScrollBarVisible: () => void;
}>(null);

const { isSticky, offsetHeader, offsetSummary, offsetScroll, stickyClassName, container } = useSticky(
  computed(() => sticky),
  computed(() => prefixCls),
);

// Footer (Fix footer must fixed header)
const summaryNode = computed(() => summary?.(mergedData.value));
const fixFooter = computed(
  () =>
    (fixHeader.value || isSticky.value) &&
    isValidElement(summaryNode.value) &&
    (summaryNode.value as VNode).type === Summary &&
    ((summaryNode.value as VNode).props as SummaryProps).fixed,
);

const { scrollXStyle, scrollYStyle, scrollTableStyle } = toRefs(
  reactiveComputed(() => {
    // Scroll
    let scrollXStyle: CSSProperties;
    let scrollYStyle: CSSProperties;
    let scrollTableStyle: CSSProperties;

    if (fixHeader.value) {
      scrollYStyle = {
        overflowY: hasData.value ? 'scroll' : 'auto',
        maxHeight: toPx(scroll.y),
      };
    }

    if (horizonScroll.value) {
      scrollXStyle = { overflowX: 'auto' };
      // When no vertical scrollbar, should hide it
      // https://github.com/ant-design/ant-design/pull/20705
      // https://github.com/ant-design/ant-design/issues/21879
      if (!fixHeader.value) {
        scrollYStyle = { overflowY: 'hidden' };
      }
      scrollTableStyle = {
        width: mergedScrollX.value === true ? 'auto' : toPx(mergedScrollX.value),
        minWidth: '100%',
      };
    }
    return {
      scrollXStyle,
      scrollYStyle,
      scrollTableStyle,
    };
  }),
);

const onColumnResize = (columnKey: VueKey, width: number) => {
  if (colsWidths.value.get(columnKey) !== width) {
    const newWidths = new Map(colsWidths.value);
    newWidths.set(columnKey, width);
    colsWidths.value = newWidths;
  }
};

const [setScrollTarget, getScrollTarget] = useTimeoutLock(null);

function forceScroll(scrollLeft: number, target: HTMLDivElement | ((left: number) => void)) {
  if (!target) {
    return;
  }
  if (typeof target === 'function') {
    target(scrollLeft);
  } else if (target.scrollLeft !== scrollLeft) {
    target.scrollLeft = scrollLeft;

    // Delay to force scroll position if not sync
    // ref: https://github.com/ant-design/ant-design/issues/37179
    if (target.scrollLeft !== scrollLeft) {
      setTimeout(() => {
        target.scrollLeft = scrollLeft;
      }, 0);
    }
  }
}

const scrollInfo = ref<ScrollInfoType>([0, 0]);

const onInternalScroll = ({ currentTarget, scrollLeft }: any) => {
  const mergedScrollLeft = typeof scrollLeft === 'number' ? scrollLeft : currentTarget.scrollLeft;

  const compareTarget = currentTarget || EMPTY_SCROLL_TARGET;
  if (!getScrollTarget() || getScrollTarget() === compareTarget) {
    setScrollTarget(compareTarget);

    forceScroll(mergedScrollLeft, scrollHeaderRef.value);
    forceScroll(mergedScrollLeft, scrollBodyRef.value);
    forceScroll(mergedScrollLeft, scrollSummaryRef.value);
    forceScroll(mergedScrollLeft, stickyRef.value?.setScrollLeft);
  }

  const measureTarget = currentTarget || scrollHeaderRef.value;
  if (measureTarget) {
    const scrollWidth =
      // Should use mergedScrollX in virtual table(useInternalHooks && tailor === true)
      useInternalHooks.value && tailor && typeof mergedScrollX.value === 'number'
        ? mergedScrollX.value
        : measureTarget.scrollWidth;
    const clientWidth = measureTarget.clientWidth;

    const absScrollStart = Math.abs(mergedScrollLeft);
    const nextScrollInfo: ScrollInfoType = [absScrollStart, scrollWidth - clientWidth];
    scrollInfo.value = isEqual(markRaw(scrollInfo.value), nextScrollInfo) ? scrollInfo.value : nextScrollInfo;

    // There is no space to scroll
    if (scrollWidth === clientWidth) {
      shadowStart.value = false;
      shadowEnd.value = false;
      return;
    }
    shadowStart.value = absScrollStart > 0;
    shadowEnd.value = absScrollStart < scrollWidth - clientWidth - 1;
  }
};

const onBodyScroll = (e) => {
  onInternalScroll(e);
  onScroll?.(e);
};

const triggerOnScroll = () => {
  if (horizonScroll.value && scrollBodyRef.value) {
    onInternalScroll({
      currentTarget: getDOM(scrollBodyRef.value) as HTMLElement,
      scrollLeft: scrollBodyRef.value?.scrollLeft,
    });
  } else {
    shadowStart.value = false;
    shadowEnd.value = false;
  }
};

const onFullTableResize = (offsetWidth?: number) => {
  stickyRef.value?.checkScrollBarVisible();
  let mergedWidth = offsetWidth ?? fullTableRef.value?.offsetWidth ?? 0;
  if (useInternalHooks.value && getContainerWidth && fullTableRef.value) {
    mergedWidth = getContainerWidth(fullTableRef.value, mergedWidth) || mergedWidth;
  }

  if (mergedWidth !== componentWidth.value) {
    triggerOnScroll();
    componentWidth.value = mergedWidth;
  }
};

// fix https://github.com/ant-design/ant-design/issues/49279
watch(
  horizonScroll,
  async () => {
    await nextTick();
    if (horizonScroll.value) {
      onFullTableResize();
    }
  },
  { flush: 'post', immediate: true, deep: true },
);

// Sync scroll bar when init or `horizonScroll`, `data` and `columns.length` changed
const mounted = ref(false);
watch(
  [horizonScroll, () => data, () => columns.value.length],
  () => {
    // onFullTableResize will be trigger once when ResizeObserver is mounted
    // This will reduce one duplicated triggerOnScroll time
    if (mounted.value) {
      triggerOnScroll();
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  mounted.value = true;
});

// ===================== Effects ======================
const scrollbarSize = ref(0);

onMounted(() => {
  if (!tailor || !useInternalHooks.value) {
    if (scrollBodyRef.value instanceof Element) {
      scrollbarSize.value = getTargetScrollBarSize(scrollBodyRef.value).width;
    } else {
      scrollbarSize.value = getTargetScrollBarSize(scrollBodyContainerRef.value).width;
    }
  }
});

// ================== INTERNAL HOOKS ==================
watchEffect(() => {
  if (useInternalHooks.value && internalRefs) {
    // eslint-disable-next-line vue/no-mutating-props
    internalRefs.body.value = scrollBodyRef.value;
  }
});

// ========================================================================
// ==                               Render                               ==
// ========================================================================
// =================== Render: Func ===================
const renderFixedHeaderTable = (fixedHolderPassProps) => (
  <>
    <Header {...fixedHolderPassProps} />
    {fixFooter.value === 'top' && <Footer {...fixedHolderPassProps}>{summaryNode.value}</Footer>}
  </>
);

const renderFixedFooterTable = (fixedHolderPassProps) => <Footer {...fixedHolderPassProps}>{summaryNode.value}</Footer>;

// =================== Render: Node ===================
const TableComponent = getComponent(['table'], 'table');

// Table layout
const mergedTableLayout = computed<TableLayout>(() => {
  if (tableLayout) {
    return tableLayout;
  }
  // https://github.com/ant-design/ant-design/issues/25227
  // When scroll.x is max-content, no need to fix table layout
  // it's width should stretch out to fit content
  if (fixColumn.value) {
    return mergedScrollX.value === 'max-content' ? 'auto' : 'fixed';
  }
  if (fixHeader.value || isSticky.value || flattenColumns.value.some(({ ellipsis }) => ellipsis)) {
    return 'fixed';
  }
  return 'auto';
});

// Header props
const headerProps = computed(() => ({
  colWidths: colWidths.value,
  columCount: flattenColumns.value.length,
  stickyOffsets: stickyOffsets.value,
  onHeaderRow,
  fixHeader: fixHeader.value,
  scroll,
}));

// Empty
const emptyNode = computed(() => {
  if (hasData.value) {
    return null;
  }

  if (typeof emptyText === 'function') {
    return (emptyText as any)();
  }
  return emptyText;
});

// Body
const BodyTable = () => {
  return <Body data={mergedData.value} measureColumnWidth={fixHeader.value || horizonScroll.value || isSticky.value} />;
};

const BodyColGroup = () => <ColGroup colWidths={flattenColumns.value.map(({ width }) => width)} columns={flattenColumns.value} />;

const CaptionElement = () =>
  caption !== null && caption !== undefined ? <caption class={`${prefixCls}-caption`}>{caption}</caption> : undefined;

const dataProps = computed(() => pickAttrs({ ...vm.props, ...vm.attrs }, { data: true }));
const ariaProps = computed(() => pickAttrs({ ...vm.props, ...vm.attrs }, { aria: true }));

const GroupTableNode = () => {
  let groupTableNode;
  if (fixHeader.value || isSticky.value) {
    // >>>>>> Fixed Header
    let bodyContent;

    if (typeof customizeScrollBody === 'function') {
      bodyContent = customizeScrollBody(mergedData.value, {
        scrollbarSize: scrollbarSize.value,
        ref: scrollBodyRef,
        onScroll: onInternalScroll,
      });

      headerProps.value.colWidths = flattenColumns.value.map(({ width }, index) => {
        const colWidth = index === flattenColumns.value.length - 1 ? (width as number) - scrollbarSize.value : width;
        if (typeof colWidth === 'number' && !Number.isNaN(colWidth)) {
          return colWidth;
        }

        return 0;
      }) as number[];
    } else {
      bodyContent = (
        <div
          style={{
            ...scrollXStyle.value,
            ...scrollYStyle.value,
          }}
          onScroll={onBodyScroll}
          ref={scrollBodyRef}
          class={`${prefixCls}-body`}
        >
          <TableComponent
            style={{
              ...scrollTableStyle.value,
              tableLayout: mergedTableLayout.value,
            }}
            {...ariaProps.value}
          >
            <CaptionElement></CaptionElement>
            <BodyColGroup></BodyColGroup>
            <BodyTable></BodyTable>
            {!fixFooter.value && summaryNode.value && (
              <Footer stickyOffsets={stickyOffsets.value} flattenColumns={flattenColumns.value}>
                {summaryNode.value}
              </Footer>
            )}
          </TableComponent>
        </div>
      );
    }

    // Fixed holder share the props
    const fixedHolderProps = {
      noData: !mergedData.value.length,
      maxContentScroll: horizonScroll.value && mergedScrollX.value === 'max-content',
      ...headerProps.value,
      ...columnContext.value,
      direction,
      stickyClassName: stickyClassName.value,
      scrollX: mergedScrollX.value,
      tableLayout: mergedTableLayout.value,
      onScroll: onInternalScroll,
    };

    groupTableNode = (
      <>
        {/* Header Table */}
        {showHeader !== false && (
          <FixedHolder
            {...fixedHolderProps}
            stickyTopOffset={offsetHeader.value}
            class={`${prefixCls}-header`}
            ref={(e: any) => (scrollHeaderRef.value = e?.el)}
            colGroup={BodyColGroup}
          >
            {renderFixedHeaderTable}
          </FixedHolder>
        )}

        {/* Body Table */}
        {bodyContent}

        {/* Summary Table */}
        {fixFooter.value && fixFooter.value !== 'top' && (
          <FixedHolder
            {...fixedHolderProps}
            stickyBottomOffset={offsetSummary.value}
            class={`${prefixCls}-summary`}
            ref={(e: any) => (scrollSummaryRef.value = e?.el)}
            colGroup={BodyColGroup}
          >
            {renderFixedFooterTable}
          </FixedHolder>
        )}

        {isSticky && scrollBodyRef.value && scrollBodyRef.value instanceof Element && (
          <StickyScrollBar
            ref={stickyRef}
            offsetScroll={offsetScroll.value}
            scrollBodyRef={scrollBodyRef}
            onScroll={onInternalScroll}
            container={container.value}
            direction={direction}
          />
        )}
      </>
    );
  } else {
    // >>>>>> Unique table
    groupTableNode = (
      <div
        style={{ ...scrollXStyle.value, ...scrollYStyle.value, ...styles?.content }}
        class={clsx(`${prefixCls}-content`, classNames?.content)}
        onScroll={onInternalScroll}
        ref={scrollBodyRef}
      >
        <TableComponent style={{ ...scrollTableStyle.value, tableLayout: mergedTableLayout.value }} {...ariaProps.value}>
          <CaptionElement></CaptionElement>
          <BodyColGroup></BodyColGroup>
          {showHeader !== false && <Header {...headerProps.value} {...columnContext.value} />}
          <BodyTable></BodyTable>
          {summaryNode.value && (
            <Footer stickyOffsets={stickyOffsets.value} flattenColumns={flattenColumns.value}>
              {summaryNode.value}
            </Footer>
          )}
        </TableComponent>
      </div>
    );
  }
  return groupTableNode;
};

const tableStyle = computed(() => {
  const result = {
    ...style,
  };
  // Add css var for sticky header `zIndex` calc
  if (isSticky.value) {
    result['--columns-count'] = flattenColumns.value.length;
  }
  return result;
});

const FullTable = () => {
  let fullTable = (
    <div
      class={clsx(prefixCls, className, {
        [`${prefixCls}-rtl`]: direction === 'rtl',
        [`${prefixCls}-fix-start-shadow`]: horizonScroll.value,
        [`${prefixCls}-fix-end-shadow`]: horizonScroll.value,
        [`${prefixCls}-fix-start-shadow-show`]: horizonScroll.value && shadowStart.value,
        [`${prefixCls}-fix-end-shadow-show`]: horizonScroll.value && shadowEnd.value,
        [`${prefixCls}-layout-fixed`]: tableLayout === 'fixed',
        [`${prefixCls}-fixed-header`]: fixHeader.value,
        /** No used but for compatible */
        [`${prefixCls}-fixed-column`]: fixColumn.value,
        [`${prefixCls}-scroll-horizontal`]: horizonScroll.value,
        [`${prefixCls}-has-fix-start`]: flattenColumns.value[0]?.fixed,
        [`${prefixCls}-has-fix-end`]: flattenColumns.value[flattenColumns.value.length - 1]?.fixed === 'end',
      })}
      style={tableStyle.value}
      id={id}
      ref={fullTableRef}
      {...dataProps.value}
    >
      {title && (
        <Panel class={clsx(`${prefixCls}-title`, classNames?.title)} style={styles?.title}>
          {title(mergedData.value)}
        </Panel>
      )}
      <div ref={scrollBodyContainerRef} class={clsx(`${prefixCls}-container`, classNames?.section)} style={styles?.section}>
        <GroupTableNode></GroupTableNode>
      </div>
      {footer && (
        <Panel class={clsx(`${prefixCls}-footer`, classNames?.footer)} style={styles?.footer}>
          {footer(mergedData.value)}
        </Panel>
      )}
    </div>
  );

  if (horizonScroll.value) {
    fullTable = <ResizeObserver onResize={({ offsetWidth }) => onFullTableResize(offsetWidth)}>{fullTable}</ResizeObserver>;
  }
  return fullTable;
};

const fixedInfoList = useFixedInfo(flattenColumns, stickyOffsets);

const TableContextValue = computed(() => ({
  // Scroll
  scrollX: mergedScrollX.value,
  scrollInfo: scrollInfo.value,

  classNames,
  styles,

  // Table
  prefixCls,
  getComponent,
  scrollbarSize: scrollbarSize.value,
  direction,
  fixedInfoList: fixedInfoList.value,
  isSticky: isSticky.value,

  componentWidth: componentWidth.value,
  fixHeader: fixHeader.value,
  fixColumn: fixColumn.value,
  horizonScroll: horizonScroll.value,

  // Body
  tableLayout: mergedTableLayout.value,
  rowClassName,
  expandedRowClassName: expandableConfig.expandedRowClassName,
  expandIcon: mergedExpandIcon.value,
  expandableType: expandableType.value,
  expandRowByClick: expandableConfig.expandRowByClick,
  expandedRowRender: expandableConfig.expandedRowRender,
  expandedRowOffset: expandableConfig.expandedRowOffset,
  onTriggerExpand,
  indentSize: expandableConfig.indentSize,
  allColumnsFixedLeft: flattenColumns.value.every((col) => col.fixed === 'start'),
  emptyNode: emptyNode.value,

  // Column
  columns: columns.value,
  flattenColumns: flattenColumns.value,
  onColumnResize,
  colWidths: colWidths.value,

  // Row
  hoverStartRow: startRow.value,
  hoverEndRow: endRow.value,
  onHover,
  rowExpandable: expandableConfig.rowExpandable,
  onRow,

  getRowKey: getRowKey.value,
  expandedKeys: mergedExpandedKeys.value,
  childrenColumnName: mergedChildrenColumnName.value,

  rowHoverable,

  // Measure Row
  measureRowRender,
}));
</script>
<template>
  <TableContextProvider :value="TableContextValue">
    <FullTable />
  </TableContextProvider>
</template>
