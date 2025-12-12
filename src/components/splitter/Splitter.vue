<script lang="tsx" setup>
import { computed, Fragment, getCurrentInstance, ref, toRefs, type CSSProperties, type VNode } from 'vue';
import useItems from './hooks/useItems';
import useResizable from './hooks/useResizable';
import useResize from './hooks/useResize';
import useSizes from './hooks/useSizes';
import type { SplitterClassNamesType, SplitterProps, SplitterSemanticDraggerClassNames, SplitterStylesType } from './interface';
import SplitBar from './SplitBar.vue';
import clsx from 'clsx';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useComponentConfig } from '../config-provider/context';
import useStyle from './style';
import ResizeObserver from '@/vc-component/resize-observer';
import InternalPanel from './Panel.vue';
import { useMergeSemantic } from '../_util/hooks';
import useOrientation from '../_util/hooks/useOrientation';

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
  onCollapse: customOnCollapse,
  lazy,
  classNames,
  styles,
  vertical,
  draggerIcon,
  collapsibleIcon,
} = defineProps<SplitterProps>();

const slots = defineSlots<{
  default: () => VNode[];
}>();

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('splitter'));
const prefixCls = computed(() => getPrefixCls.value('splitter', customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

// ======================== Direct ========================
const [mergedOrientation, isVertical] = useOrientation(
  computed(() => orientation),
  computed(() => vertical),
);

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
const resizableInfos = useResizable(items, itemPxSizes, reverse);

const [onOffsetStart, onOffsetUpdate, onOffsetEnd, onCollapse, movingIndex] = useResize(
  items,
  resizableInfos,
  itemPtgSizes,
  containerSize,
  updateSizes,
  reverse,
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
  const collapsed = nextSizes.map((size) => Math.abs(size) < Number.EPSILON);
  customOnCollapse?.(collapsed, nextSizes);
};

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<SplitterClassNamesType, SplitterStylesType, SplitterProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      vertical: isVertical.value,
      orientation: mergedOrientation.value,
    },
  })),
  computed(() => ({
    // Convert `classNames.dragger: 'a'` to
    // `classNames.dragger: { default: 'a' }`
    dragger: {
      _default: 'default',
    },
  })),
);

// ======================== Styles ========================
const containerClassName = computed(() =>
  clsx(
    prefixCls.value,
    className,
    `${prefixCls.value}-${mergedOrientation.value}`,
    {
      [`${prefixCls.value}-rtl`]: isRTL.value,
    },
    rootClassName,
    mergedClassNames.value?.root,
    contextClassName?.value,
    cssVarCls?.value,
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

const mergedStyle = computed<CSSProperties>(() => ({ ...mergedStyles.value?.root, ...contextStyle?.value, ...style }));

const renderItem = (item, idx) => {
  const panelProps = {
    ...item,
    class: clsx(mergedClassNames.value?.panel, item.class),
    style: { ...mergedStyles.value?.panel, ...item.style },
  };
  const panel = <InternalPanel {...panelProps} prefixCls={prefixCls.value} size={panelSizes.value[idx]} v-slots={item.slots} />;

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
        draggerStyle={mergedStyles.value?.dragger}
        draggerClassName={mergedClassNames.value?.dragger as SplitterSemanticDraggerClassNames}
        draggerIcon={draggerIcon}
        collapsibleIcon={collapsibleIcon}
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
      <div v-if="typeof movingIndex === 'number'" aria-hidden :class="clsx(maskCls, `${maskCls}-${mergedOrientation}`)"></div>
    </div>
  </ResizeObserver>
</template>
