<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { useSliderContextInject } from '../context';
import type { OnStartMove } from '../interface';
import { getOffset } from '../util';

export interface TrackProps {
  prefixCls: string;
  style?: CSSProperties;
  /** Replace with origin prefix concat className */
  replaceCls?: string;
  start: number | null;
  end: number | null;
  index: number;
  onStartMove?: OnStartMove;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, style, start, end, index, onStartMove, replaceCls } = defineProps<TrackProps>();

const { direction, min, max, disabled, range, classNames } = toRefs(useSliderContextInject());

const trackPrefixCls = `${prefixCls}-track`;

const offsetStart = computed(() => getOffset(start, min.value, max.value));
const offsetEnd = computed(() => getOffset(end, min.value, max.value));

// ============================ Events ============================
const onInternalStartMove = (e: MouseEvent | TouchEvent) => {
  if (!disabled.value && onStartMove) {
    onStartMove(e, -1);
  }
};

// ============================ Render ============================
const positionStyle = computed(() => {
  const result: CSSProperties = {};
  switch (direction.value) {
    case 'rtl':
      result.right = `${offsetStart.value * 100}%`;
      result.width = `${offsetEnd.value * 100 - offsetStart.value * 100}%`;
      break;

    case 'btt':
      result.bottom = `${offsetStart.value * 100}%`;
      result.height = `${offsetEnd.value * 100 - offsetStart.value * 100}%`;
      break;

    case 'ttb':
      result.top = `${offsetStart.value * 100}%`;
      result.height = `${offsetEnd.value * 100 - offsetStart.value * 100}%`;
      break;

    default:
      result.left = `${offsetStart.value * 100}%`;
      result.width = `${offsetEnd.value * 100 - offsetStart.value * 100}%`;
  }
  return result;
});

const className = computed(
  () =>
    replaceCls ||
    clsx(
      trackPrefixCls,
      {
        [`${trackPrefixCls}-${index + 1}`]: index !== null && range.value,
        [`${prefixCls}-track-draggable`]: onStartMove,
      },
      classNames.value?.track,
    ),
);
</script>
<template>
  <div
    :class="className"
    :style="{ ...positionStyle, ...style }"
    @mousedown="onInternalStartMove"
    @touchstart.passive="onInternalStartMove"
  ></div>
</template>
