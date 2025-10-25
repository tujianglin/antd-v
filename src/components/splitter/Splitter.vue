<script lang="tsx" setup>
import { computed, Fragment, ref, toRefs, type CSSProperties, type VNode } from 'vue';
import useItems from './hooks/useItems';
import useResizable from './hooks/useResizable';
import useResize from './hooks/useResize';
import useSizes from './hooks/useSizes';
import type { SplitterProps } from './interface';
import SplitBar from './SplitBar.vue';
import clsx from 'clsx';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useComponentConfig } from '../config-provider/context';
import useStyle from './style';
import ResizeObserver from '@/vc-component/resize-observer';
import InternalPanel from './Panel.vue';

defineOptions({ name: 'Splitter', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  style,
  orientation = 'horizontal',
  rootClassName,
  onResizeStart,
  onResize,
  onResizeEnd,
  lazy,
} = defineProps<SplitterProps>();

const slots = defineSlots<{
  default: () => VNode[];
}>();

const { getPrefixCls, direction, class: contextClassName, style: contextStyle } = toRefs(useComponentConfig('splitter'));
const prefixCls = computed(() => getPrefixCls.value('splitter', customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);
const [, hashId] = useStyle(prefixCls, rootCls);

// ======================== Direct ========================
const isVertical = computed(() => orientation === 'vertical');
const isRTL = computed(() => direction?.value === 'rtl');
const reverse = computed(() => !isVertical.value && isRTL.value);

const items = useItems(slots);

const containerSize = ref<number | undefined>();

const onContainerResize = (size) => {
  const { offsetWidth, offsetHeight } = size;
  const cSize = isVertical.value ? offsetHeight : offsetWidth;
  // Skip when container has no size, Such as nested in a hidden tab panel
  // to fix: https://github.com/ant-design/ant-design/issues/51106
  if (cSize === 0) {
    return;
  }
  containerSize.value = cSize;
};

// ========================= Size =========================
const [panelSizes, itemPxSizes, itemPtgSizes, itemPtgMinSizes, itemPtgMaxSizes, updateSizes] = useSizes(items, containerSize);

// ====================== Resizable =======================
const resizableInfos = useResizable(items, itemPxSizes, isRTL);

const [onOffsetStart, onOffsetUpdate, onOffsetEnd, onCollapse, movingIndex] = useResize(
  items,
  resizableInfos,
  itemPtgSizes,
  containerSize,
  updateSizes,
  isRTL,
);

// ======================== Events ========================
const onInternalResizeStart = (index: number) => {
  onOffsetStart(index);
  onResizeStart?.(itemPxSizes.value);
};

const onInternalResizeUpdate = (index: number, offset: number, lazyEnd?: boolean) => {
  const nextSizes = onOffsetUpdate(index, offset);

  if (lazyEnd) {
    onResizeEnd?.(nextSizes);
  } else {
    onResize?.(nextSizes);
  }
};

const onInternalResizeEnd = (lazyEnd?: boolean) => {
  onOffsetEnd();

  if (!lazyEnd) {
    onResizeEnd?.(itemPxSizes.value);
  }
};

const onInternalCollapse = (index: number, type: 'start' | 'end') => {
  const nextSizes = onCollapse(index, type);
  onResize?.(nextSizes);
  onResizeEnd?.(nextSizes);
};

// ======================== Styles ========================
const containerClassName = computed(() =>
  clsx(
    prefixCls.value,
    className,
    `${prefixCls.value}-${orientation}`,
    {
      [`${prefixCls.value}-rtl`]: isRTL.value,
    },
    rootClassName,
    contextClassName?.value,
    rootCls.value,
    hashId.value,
  ),
);

// ======================== Render ========================
const maskCls = computed(() => `${prefixCls.value}-mask`);

const stackSizes = computed(() => {
  const mergedSizes: number[] = [];
  let stack = 0;
  for (let i = 0; i < items.value?.length; i += 1) {
    stack += itemPtgSizes.value[i];
    mergedSizes.push(stack);
  }

  return mergedSizes;
});

const mergedStyle = computed<CSSProperties>(() => ({ ...contextStyle?.value, ...style }));

const renderItem = (item, idx) => {
  const panel = <InternalPanel {...item} prefixCls={prefixCls.value} size={panelSizes.value[idx]} v-slots={item.slots} />;

  // Split Bar
  let splitBar = null;

  const resizableInfo = resizableInfos.value?.[idx];

  if (resizableInfo) {
    const ariaMinStart = (stackSizes.value[idx - 1] || 0) + itemPtgMinSizes.value[idx];
    const ariaMinEnd = (stackSizes.value[idx + 1] || 100) - itemPtgMaxSizes.value[idx + 1];

    const ariaMaxStart = (stackSizes.value[idx - 1] || 0) + itemPtgMaxSizes.value[idx];
    const ariaMaxEnd = (stackSizes.value[idx + 1] || 100) - itemPtgMinSizes.value[idx + 1];
    splitBar = (
      <SplitBar
        lazy={lazy}
        index={idx}
        active={movingIndex.value === idx}
        prefixCls={prefixCls.value}
        vertical={isVertical.value}
        resizable={resizableInfo.resizable}
        ariaNow={stackSizes.value[idx] * 100}
        ariaMin={Math.max(ariaMinStart, ariaMinEnd) * 100}
        ariaMax={Math.min(ariaMaxStart, ariaMaxEnd) * 100}
        startCollapsible={resizableInfo.startCollapsible}
        endCollapsible={resizableInfo.endCollapsible}
        showStartCollapsibleIcon={resizableInfo.showStartCollapsibleIcon}
        showEndCollapsibleIcon={resizableInfo.showEndCollapsibleIcon}
        onOffsetStart={onInternalResizeStart}
        onOffsetUpdate={(index, offsetX, offsetY, lazyEnd) => {
          let offset = isVertical.value ? offsetY : offsetX;
          if (reverse.value) {
            offset = -offset;
          }
          onInternalResizeUpdate(index, offset, lazyEnd);
        }}
        onOffsetEnd={onInternalResizeEnd}
        onCollapse={onInternalCollapse}
        containerSize={containerSize.value || 0}
      />
    );
  }
  return (
    <Fragment key={`split-panel-${idx}`}>
      {panel}
      {splitBar}
    </Fragment>
  );
};
</script>
<template>
  <ResizeObserver @resize="onContainerResize">
    <div :style="mergedStyle" :class="containerClassName">
      <template v-for="(item, idx) in items" :key="idx">
        <component :is="renderItem(item, idx)" />
      </template>
      <div v-if="typeof movingIndex === 'number'" aria-hidden :class="clsx(maskCls, `${maskCls}-${orientation}`)"></div>
    </div>
  </ResizeObserver>
</template>
