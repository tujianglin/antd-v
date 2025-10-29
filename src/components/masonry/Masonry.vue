<script lang="tsx" setup>
import { CSSMotionList } from '@/vc-component/motion';
import ResizeObserver from '@/vc-component/resize-observer';
import { composeRef } from '@/vc-util/ref';
import type { VueKey, VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { isEqual } from 'lodash-es';
import { computed, getCurrentInstance, nextTick, ref, toRefs, useTemplateRef, watch, type CSSProperties } from 'vue';
import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks/useMergeSemantic';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import type { Breakpoint } from '../_util/responsiveObserver';
import { responsiveArray } from '../_util/responsiveObserver';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { RowProps } from '../grid';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import useGutter from '../grid/hooks/useGutter';
import useDelay from './hooks/useDelay';
import type { ItemHeightData } from './hooks/usePositions';
import usePositions from './hooks/usePositions';
import useRefs from './hooks/useRefs';
import type { MasonryItemType } from './MasonryItem.vue';
import MasonryItem from './MasonryItem.vue';
import useStyle from './style';

export type Gap = number | undefined;
export type Key = string | number;

export type SemanticName = 'root' | 'item';

export type MasonryClassNamesType = SemanticClassNamesType<MasonryProps, SemanticName>;
export type MasonryStylesType = SemanticStylesType<MasonryProps, SemanticName>;

export interface MasonryProps<ItemDataType = any> {
  // Style
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;

  classNames?: MasonryClassNamesType;
  styles?: MasonryStylesType;

  /** Spacing between items */
  gutter?: RowProps['gutter'];

  // Data
  items?: MasonryItemType<ItemDataType>[];

  itemRender?: (itemInfo: MasonryItemType<ItemDataType> & { index: number }) => VueNode;

  /** Number of columns in the masonry grid layout */
  columns?: number | Partial<Record<Breakpoint, number>>;

  /** Trigger when item layout order changed */
  onLayoutChange?: (sortInfo: { key: VueKey; column: number }[]) => void;

  fresh?: boolean;
}

export interface MasonryRef {
  nativeElement: HTMLDivElement;
}

type ItemColumnsType = [item: MasonryItemType, column: number];

defineOptions({ name: 'Masonry', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rootClassName,
  class: className,
  style,
  classNames,
  styles,
  columns,
  prefixCls: customizePrefixCls,
  gutter = 0,
  items,
  itemRender,
  onLayoutChange,
  fresh,
} = defineProps<MasonryProps>();

// ======================= MISC =======================
const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('masonry'));

const prefixCls = computed(() => getPrefixCls.value('masonry', customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

// ======================= Refs =======================
const containerRef = useTemplateRef('containerRef');

defineExpose({
  get nativeElement() {
    return containerRef.value!;
  },
});

const [setItemRef, getItemRef] = useRefs();

// ======================= Item =======================
const mergedItems = ref<MasonryItemType[]>([]);

watch(
  () => items,
  () => {
    mergedItems.value = items || [];
  },
  { deep: true, immediate: true },
);

// ==================== Breakpoint ====================
const screens = useBreakpoint();
const gutters = useGutter(
  computed(() => gutter),
  screens,
);
const horizontalGutter = computed(() => gutters.value?.[0] || 0);
const verticalGutter = computed(() => gutters.value?.[1] || horizontalGutter.value);

// ====================== Layout ======================
const columnCount = computed<number>(() => {
  if (!columns) {
    return 3;
  }

  if (typeof columns === 'number') {
    return columns;
  }

  // Find first matching responsive breakpoint
  const matchingBreakpoint = responsiveArray.find((breakpoint) => screens.value[breakpoint] && columns[breakpoint] !== undefined);

  if (matchingBreakpoint) {
    return columns[matchingBreakpoint] as number;
  }

  return columns.xs ?? 1;
});

// =========== Merged Props for Semantic ==========
const vm = getCurrentInstance();
const mergedProps = computed(() => {
  return {
    ...vm.props,
    columns: columnCount.value,
  } as MasonryProps;
});

const [mergedClassNames, mergedStyles] = useMergeSemantic<MasonryClassNamesType, MasonryStylesType, MasonryProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  undefined,
  computed(() => ({ props: mergedProps.value })),
);

// ================== Items Position ==================
const itemHeights = ref<ItemHeightData[]>([]);

const collectItemSize = useDelay(() => {
  const nextItemsHeight = mergedItems.value?.map<ItemHeightData>((item, index) => {
    const itemKey = item.key ?? index;
    const itemEle = getItemRef(itemKey);
    const rect = itemEle?.getBoundingClientRect();
    return [itemKey, rect ? rect.height : 0, item.column];
  });

  itemHeights.value = isEqual(itemHeights.value, nextItemsHeight) ? itemHeights.value : nextItemsHeight;
});

const [itemPositions, totalHeight] = usePositions(itemHeights, columnCount, verticalGutter);

const itemWithPositions = computed(() =>
  mergedItems.value?.map((item, index) => {
    const key = item.key ?? index;
    return {
      item,
      itemIndex: index,
      // CSSMotion will transform key to string.
      // Let's keep the original key here.
      itemKey: key,
      key,
      position: (itemPositions.value as any)?.get(key),
    };
  }),
);

watch([mergedItems, columnCount], () => {
  collectItemSize();
});

// Trigger for `onLayoutChange`
const itemColumns = ref<ItemColumnsType[]>([]);

watch(
  itemWithPositions,
  async () => {
    await nextTick();
    if (onLayoutChange && itemWithPositions.value?.every(({ position }) => position)) {
      const nextItemColumns = itemWithPositions.value?.map<ItemColumnsType>(({ item, position }) => [item, position!.column]);
      itemColumns.value = isEqual(itemColumns.value, nextItemColumns) ? itemColumns.value : nextItemColumns;
    }
  },
  { immediate: true, deep: true, flush: 'post' },
);

watch(
  itemColumns,
  () => {
    if (onLayoutChange && items && items.length === itemColumns.value.length) {
      onLayoutChange(itemColumns.value.map(([item, column]) => ({ ...item, column })));
    }
  },
  { immediate: true, deep: true, flush: 'post' },
);
</script>
<template>
  <ResizeObserver @resize="collectItemSize">
    <div
      ref="containerRef"
      :class="
        clsx(prefixCls, contextClassName, mergedClassNames.root, rootClassName, className, hashId, cssVarCls, {
          [`${prefixCls}-rtl`]: direction === 'rtl',
        })
      "
      :style="{
        height: `${totalHeight}px`,
        ...mergedStyles.root,
        ...contextStyle,
        ...style,
      }"
      @load="collectItemSize"
      @error="collectItemSize"
    >
      <CSSMotionList
        :keys="itemWithPositions"
        :component="false"
        motion-appear
        motion-leave
        :motion-name="`${prefixCls}-item-fade`"
      >
        <template
          #default="{ item, itemKey, position = {}, itemIndex, key, class: motionClassName, style: motionStyle, ref: motionRef }"
        >
          <MasonryItem
            :prefix-cls="prefixCls"
            :key="key"
            :item="item"
            :style="{
              ...motionStyle,
              ...mergedStyles.item,
              ...{
                '--item-width': `calc((100% + ${horizontalGutter}px) / ${columnCount})`,
                insetInlineStart: `calc(var(--item-width) * ${position.column || 0})`,
                width: `calc(var(--item-width) - ${horizontalGutter}px)`,
                top: `${position.top}px`,
                position: 'absolute',
              },
            }"
            :class="clsx(mergedClassNames.item, motionClassName)"
            :ref="composeRef((ele) => setItemRef(itemKey, ele?.el), motionRef)"
            :index="itemIndex"
            :item-render="itemRender"
            :column="position.column || 0"
            @resize="() => (fresh ? collectItemSize() : null)"
          />
        </template>
      </CSSMotionList>
    </div>
  </ResizeObserver>
</template>
