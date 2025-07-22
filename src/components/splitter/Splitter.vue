<script lang="tsx" setup>
import { computed, ref, useSlots } from 'vue';
import useItems from './hooks/useItems';
import useResizable from './hooks/useResizable';
import useResize from './hooks/useResize';
import useSizes from './hooks/useSizes';
import type { SplitterProps } from './interface';
import SplitBar from './SplitBar.vue';
import { vResizeObserver } from '@vueuse/components';
import Panel from './Panel.vue';
import clsx from 'clsx';

defineOptions({ name: 'Splitter' });

const { layout = 'horizontal', onResize, onResizeEnd, lazy } = defineProps<SplitterProps>();

const slots = useSlots();

const items = useItems(slots);

const containerSize = ref<number | undefined>();

const [panelSizes, itemPxSizes, itemPtgSizes, itemPtgMinSizes, itemPtgMaxSizes, innerSizes] = useSizes(items, containerSize);

const resizableInfos = useResizable(items, itemPxSizes);

const [onOffsetStart, onOffsetUpdate, onOffsetEnd, onCollapse, movingIndex] = useResize(
  items,
  resizableInfos,
  itemPtgSizes,
  containerSize,
  innerSizes,
);

const isVertical = computed(() => layout === 'vertical');
const reverse = computed(() => !isVertical.value);
const stackSizes = computed(() => {
  const mergedSizes: number[] = [];
  let stack = 0;
  for (let i = 0; i < items.length; i += 1) {
    stack += itemPtgSizes.value[i];
    mergedSizes.push(stack);
  }

  return mergedSizes;
});

function onResizeObserver(entries) {
  const [entry] = entries;
  const { width, height } = entry.contentRect;
  containerSize.value = isVertical.value ? height : width;
}

function onInternalResizeUpdate(index: number, offset: number, lazyEnd?: boolean) {
  const nextSizes = onOffsetUpdate(index, offset);
  if (lazyEnd) {
    onResizeEnd?.(nextSizes);
  } else {
    onResize?.(nextSizes);
  }
}

function onInternalResizeEnd(lazyEnd?: boolean) {
  onOffsetEnd();
  if (!lazyEnd) {
    onResizeEnd?.(itemPxSizes.value);
  }
}

function onInternalCollapse(index: number, type: 'start' | 'end') {
  const nextSizes = onCollapse(index, type);
  onResize?.(nextSizes);
  onResizeEnd?.(nextSizes);
}

const splterBar = (idx) => {
  const resizableInfo = resizableInfos.value?.[idx];
  if (resizableInfo) {
    const ariaMinStart = (stackSizes.value[idx - 1] || 0) + itemPtgMinSizes.value[idx];
    const ariaMinEnd = (stackSizes.value[idx + 1] || 100) - itemPtgMaxSizes.value[idx + 1];

    const ariaMaxStart = (stackSizes.value[idx - 1] || 0) + itemPtgMaxSizes.value[idx];
    const ariaMaxEnd = (stackSizes.value[idx + 1] || 100) - itemPtgMinSizes.value[idx + 1];
    return (
      <SplitBar
        lazy={lazy}
        index={idx}
        active={movingIndex.value?.index === idx}
        vertical={isVertical.value}
        resizable={resizableInfo.resizable}
        ariaNow={stackSizes.value[idx] * 100}
        ariaMin={Math.max(ariaMinStart, ariaMinEnd) * 100}
        ariaMax={Math.min(ariaMaxStart, ariaMaxEnd) * 100}
        startCollapsible={resizableInfo.startCollapsible}
        endCollapsible={resizableInfo.endCollapsible}
        container-size={containerSize.value || 0}
        onOffsetStart={onOffsetStart}
        onOffsetUpdate={(index, offsetX, offsetY, lazyEnd) => {
          let offset = isVertical.value ? offsetY : -offsetX;
          if (reverse.value) {
            offset = -offset;
          }
          onInternalResizeUpdate(index, offset, lazyEnd);
        }}
        onOffsetEnd={onInternalResizeEnd}
        onCollapse={onInternalCollapse}
      />
    );
  }
  return <div></div>;
};
</script>
<template>
  <div
    v-resize-observer="onResizeObserver"
    :class="clsx('m-0 box-border flex size-full resize items-stretch p-0', isVertical ? 'flex-col' : 'flex-row', $attrs?.class)"
  >
    <template v-for="(item, idx) in items" :key="idx">
      <Panel v-bind="item" :size="panelSizes[idx]" :class="rootClassName">
        <template v-for="(slot, name) in item.slots" #[name] :key="name">
          <component :is="slot" />
        </template>
      </Panel>
      <component :is="splterBar(idx)" :size="barSize" />
    </template>
  </div>
</template>
