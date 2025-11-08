<!-- eslint-disable vue/define-macros-order -->
<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, onBeforeUnmount, onMounted, useTemplateRef, type CSSProperties, type Ref } from 'vue';
import ColGroup from '../ColGroup.vue';
import { useTableContextInject } from '../context/TableContext';
import type { HeaderProps } from '../Header/Header.vue';
import type { ColumnsType, ColumnType, Direction, TableLayout } from '../interface';

function useColumnWidth(colWidths: Ref<number[]>, columCount: Ref<number>) {
  return computed(() => {
    const cloneColumns: number[] = [];
    for (let i = 0; i < columCount.value; i += 1) {
      const val = colWidths.value[i];
      if (val !== undefined) {
        cloneColumns[i] = val;
      } else {
        return null;
      }
    }
    return cloneColumns;
  });
}

export interface FixedHeaderProps<RecordType> extends HeaderProps<RecordType> {
  class: string;
  style?: CSSProperties;
  noData: boolean;
  maxContentScroll: boolean;
  colWidths: number[];
  columCount: number;
  direction: Direction | undefined;
  fixHeader: boolean | undefined;
  stickyTopOffset?: number;
  stickyBottomOffset?: number;
  stickyClassName?: string;
  scrollX?: number | string | true;
  tableLayout?: TableLayout;
  onScroll: (info: { currentTarget: HTMLDivElement; scrollLeft?: number }) => void;
  colGroup?: VueNode;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  class: className,
  style,
  noData,
  columns,
  flattenColumns,
  colWidths,
  colGroup,
  columCount,
  stickyOffsets,
  direction,
  fixHeader,
  stickyTopOffset,
  stickyBottomOffset,
  stickyClassName,
  scrollX,
  tableLayout = 'fixed',
  onScroll,
  ...restProps
} = defineProps<FixedHeaderProps<any>>();

const { prefixCls, scrollbarSize, isSticky, getComponent } = useTableContextInject();

const TableComponent = getComponent.value(['header', 'table'], 'table');

const combinationScrollBarSize = computed(() => (isSticky.value && !fixHeader ? 0 : scrollbarSize.value));

// Pass wheel to scroll event
const scrollRef = useTemplateRef('scrollRef');

function onWheel(e: WheelEvent) {
  const { currentTarget, deltaX } = e as unknown as any;
  if (deltaX) {
    const { scrollLeft, scrollWidth, clientWidth } = currentTarget;
    const maxScrollWidth = scrollWidth - clientWidth;
    let nextScroll = scrollLeft + deltaX;

    if (direction === 'rtl') {
      nextScroll = Math.max(-maxScrollWidth, nextScroll);
      nextScroll = Math.min(0, nextScroll);
    } else {
      nextScroll = Math.min(maxScrollWidth, nextScroll);
      nextScroll = Math.max(0, nextScroll);
    }

    onScroll({
      currentTarget,
      scrollLeft: nextScroll,
    });
    e.preventDefault();
  }
}

onMounted(() => {
  const scrollEle = scrollRef.value;
  scrollEle?.addEventListener('wheel', onWheel, { passive: false });
});

onBeforeUnmount(() => {
  scrollRef.value?.removeEventListener('wheel', onWheel);
});

// Add scrollbar column
const lastColumn = computed(() => flattenColumns[flattenColumns.length - 1]);
const ScrollBarColumn = computed<ColumnType<unknown> & { scrollbar: true }>(() => ({
  fixed: lastColumn.value ? lastColumn.value.fixed : null,
  scrollbar: true,
  onHeaderCell: () => ({
    class: `${prefixCls.value}-cell-scrollbar`,
  }),
}));

const columnsWithScrollbar = computed<ColumnsType<unknown>>(() =>
  combinationScrollBarSize.value ? [...columns, ScrollBarColumn.value] : columns,
);

const flattenColumnsWithScrollbar = computed(() =>
  combinationScrollBarSize.value ? [...flattenColumns, ScrollBarColumn.value] : flattenColumns,
);

// Calculate the sticky offsets
const headerStickyOffsets = computed(() => {
  const { start, end } = stickyOffsets;
  return {
    ...stickyOffsets,
    // left:
    //   direction === 'rtl' ? [...left.map(width => width + combinationScrollBarSize), 0] : left,
    // right:
    //   direction === 'rtl' ? right : [...right.map(width => width + combinationScrollBarSize), 0],
    start,
    end: [...end.map((width) => width + combinationScrollBarSize.value), 0],
    isSticky: isSticky.value,
  };
});

const mergedColumnWidth = useColumnWidth(
  computed(() => colWidths),
  computed(() => columCount),
);

const isColGroupEmpty = computed<boolean>(() => {
  // use original ColGroup if no data or no calculated column width, otherwise use calculated column width
  // Return original colGroup if no data, or mergedColumnWidth is empty, or all widths are falsy
  const noWidth = !mergedColumnWidth.value || !mergedColumnWidth.value.length || mergedColumnWidth.value.every((w) => !w);
  return noData || noWidth;
});

defineExpose({
  get el() {
    return scrollRef.value;
  },
});
</script>
<template>
  <div
    :style="{
      overflow: 'hidden',
      ...(isSticky ? { top: `${stickyTopOffset}px`, bottom: `${stickyBottomOffset}px` } : {}),
      ...style,
    }"
    ref="scrollRef"
    :class="
      clsx(className, {
        [stickyClassName]: !!stickyClassName,
      })
    "
  >
    <component
      :is="TableComponent"
      :style="{
        tableLayout,
        minWidth: '100%',
        width: typeof scrollX === 'string' ? scrollX : scrollX ? `${scrollX}px` : null,
      }"
    >
      <component v-if="isColGroupEmpty" :is="colGroup" />
      <ColGroup
        v-else
        :col-widths="[...mergedColumnWidth, combinationScrollBarSize]"
        :colum-count="columCount + 1"
        :columns="flattenColumnsWithScrollbar"
      />
      <slot
        v-bind="restProps"
        :sticky-offsets="headerStickyOffsets"
        :columns="columnsWithScrollbar"
        :flatten-columns="flattenColumnsWithScrollbar"
      ></slot>
    </component>
  </div>
</template>
