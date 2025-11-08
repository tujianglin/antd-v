<script lang="tsx" setup>
import type { VueKey } from '@/vc-util/type';
import { computed, ref, watch, type CSSProperties, type TdHTMLAttributes } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import useFlattenRecords from '../hooks/useFlattenRecords';
import type { ColumnType, OnCustomizeScroll, ScrollConfig } from '../interface';
import { GridContextProvider, useStaticContextInject } from './context';
import type { ListProps, ListRef } from '@/vc-component/virtual-list';
import VirtualList from '@/vc-component/virtual-list';
import BodyLine from './BodyLine.vue';

export interface GridProps<RecordType = any> {
  data: RecordType[];
  onScroll: OnCustomizeScroll;
}

export interface GridRef {
  scrollLeft: number;
  nativeElement: HTMLDivElement;
  scrollTo: (scrollConfig: ScrollConfig) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });
const { data, onScroll } = defineProps<GridProps>();

const { flattenColumns, onColumnResize, getRowKey, expandedKeys, prefixCls, childrenColumnName, scrollX, direction } =
  useTableContextInject();

const { sticky, scrollY, listItemHeight, getComponent, onScroll: onTablePropScroll } = useStaticContextInject();

// =========================== Ref ============================
const listRef = ref<ListRef>(null);

// =========================== Data ===========================
const flattenData = useFlattenRecords(
  computed(() => data),
  childrenColumnName,
  expandedKeys,
  getRowKey,
);

// ========================== Column ==========================
const columnsWidth = computed<[key: VueKey, width: number, total: number][]>(() => {
  let total = 0;
  return flattenColumns.value.map(({ width, minWidth, key }) => {
    const finalWidth = Math.max((width as number) || 0, (minWidth as number) || 0);
    total += finalWidth;
    return [key, finalWidth, total];
  });
});

const columnsOffset = computed<number[]>(() => columnsWidth.value.map((colWidth) => colWidth[2]));

watch(
  columnsWidth,
  () => {
    columnsWidth.value.forEach(([key, width]) => {
      onColumnResize?.value?.(key, width);
    });
  },
  { immediate: true, deep: true },
);

// =========================== Ref ============================
defineExpose({
  scrollTo: (config: ScrollConfig) => {
    const { offset, ...restConfig } = config;

    // If offset is provided, force align to 'top' for consistent behavior
    if (offset) {
      listRef.value?.scrollTo({ ...restConfig, offset, align: 'top' });
    } else {
      listRef.value?.scrollTo(config);
    }
  },
  get nativeElement() {
    return listRef.value?.nativeElement;
  },
  get scrollLeft() {
    return listRef.value?.getScrollInfo().x || 0;
  },
  set scrollLeft(value: number) {
    listRef.value?.scrollTo({ left: value });
  },
  get scrollTop() {
    return listRef.value?.getScrollInfo().y || 0;
  },
  set scrollTop(value: number) {
    listRef.value?.scrollTo({ top: value });
  },
});

// ======================= Col/Row Span =======================
const getRowSpan = (column: ColumnType<any>, index: number): number => {
  const record = flattenData.value?.[index]?.record;
  const { onCell } = column;

  if (onCell && record) {
    const cellProps = onCell(record, index) as TdHTMLAttributes;
    return (cellProps?.rowspan as number) ?? 1;
  }
  return 1;
};

const extraRender: ListProps<any>['extraRender'] = (info) => {
  const { start, end, getSize, offsetY } = info;

  // Do nothing if no data
  if (end < 0) {
    return null;
  }

  // Find first rowSpan column
  let firstRowSpanColumns = flattenColumns.value.filter(
    // rowSpan is 0
    (column) => getRowSpan(column, start) === 0,
  );

  let startIndex = start;
  for (let i = start; i >= 0; i -= 1) {
    firstRowSpanColumns = firstRowSpanColumns.filter((column) => getRowSpan(column, i) === 0);

    if (!firstRowSpanColumns.length) {
      startIndex = i;
      break;
    }
  }

  // Find last rowSpan column
  let lastRowSpanColumns = flattenColumns.value.filter(
    // rowSpan is not 1
    (column) => getRowSpan(column, end) !== 1,
  );

  let endIndex = end;
  for (let i = end; i < flattenData.value.length; i += 1) {
    lastRowSpanColumns = lastRowSpanColumns.filter((column) => getRowSpan(column, i) !== 1);

    if (!lastRowSpanColumns.length) {
      endIndex = Math.max(i - 1, end);
      break;
    }
  }

  // Collect the line who has rowSpan
  const spanLines: number[] = [];

  for (let i = startIndex; i <= endIndex; i += 1) {
    const item = flattenData.value[i];

    // This code will never reach, just incase
    if (!item) {
      continue;
    }

    if (flattenColumns.value.some((column) => getRowSpan(column, i) > 1)) {
      spanLines.push(i);
    }
  }
  // Patch extra line on the page
  const nodes = spanLines.map((index) => {
    const item = flattenData.value[index];

    const rowKey = getRowKey.value(item.record, index);

    const getHeight = (rowSpan: number) => {
      const endItemIndex = index + rowSpan - 1;
      const endItemKey = getRowKey.value(flattenData.value[endItemIndex].record, endItemIndex);

      const sizeInfo = getSize(rowKey, endItemKey);
      return sizeInfo.bottom - sizeInfo.top;
    };

    const sizeInfo = getSize(rowKey);

    return (
      <BodyLine
        key={index}
        data={item}
        rowKey={rowKey}
        index={index}
        style={{
          top: `${-offsetY + sizeInfo.top}px`,
        }}
        extra
        getHeight={getHeight}
      />
    );
  });

  return nodes;
};

// ========================= Context ==========================
const gridContext = computed(() => ({ columnsOffset: columnsOffset.value }));

// ========================== Render ==========================
const tblPrefixCls = computed(() => `${prefixCls.value}-tbody`);

// default 'div' in rc-virtual-list
const wrapperComponent = getComponent.value(['body', 'wrapper']);

// ========================== Sticky Scroll Bar ==========================
const horizontalScrollBarStyle = computed(() => {
  const result: CSSProperties = {};
  if (sticky.value) {
    result.position = 'sticky';
    result.bottom = 0;
    if (typeof sticky.value === 'object' && sticky.value.offsetScroll) {
      result.bottom = sticky.value.offsetScroll;
    }
  }
  return result;
});
</script>
<template>
  <GridContextProvider :value="gridContext">
    <VirtualList
      :full-height="false"
      ref="listRef"
      :prefix-cls="`${tblPrefixCls}-virtual`"
      :styles="{
        horizontalScrollBar: horizontalScrollBarStyle,
      }"
      :class="tblPrefixCls"
      :height="scrollY"
      :item-height="listItemHeight || 24"
      :data="flattenData"
      :item-key="(item) => getRowKey(item.record)"
      :component="wrapperComponent"
      :scroll-width="scrollX as number"
      :direction="direction"
      @virtual-scroll="
        ({ x }) => {
          onScroll({
            currentTarget: listRef?.nativeElement,
            scrollLeft: x,
          });
        }
      "
      @scroll="onTablePropScroll"
      :extra-render="extraRender"
    >
      <template #default="{ item, index, props: itemProps }">
        <BodyLine :data="item" :row-key="getRowKey(item.record, index)" :index="index" :style="itemProps.style" />
      </template>
    </VirtualList>
  </GridContextProvider>
</template>
