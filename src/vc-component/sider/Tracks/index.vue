<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { useSliderContextInject } from '../context';
import type { OnStartMove } from '../interface';
import { getIndex } from '../util';
import Track from './Track.vue';
export interface TrackProps {
  prefixCls: string;
  style?: CSSProperties;
  values: number[];
  onStartMove?: OnStartMove;
  startPoint?: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, style, values, startPoint, onStartMove } = defineProps<TrackProps>();

const { included, range, min, styles, classNames } = toRefs(useSliderContextInject());

// =========================== List ===========================
const trackList = computed(() => {
  if (!range.value) {
    // null value do not have track
    if (values.length === 0) {
      return [];
    }

    const startValue = startPoint ?? min.value;
    const endValue = values[0];

    return [{ start: Math.min(startValue, endValue), end: Math.max(startValue, endValue) }];
  }

  // Multiple
  const list: { start: number; end: number }[] = [];

  for (let i = 0; i < values.length - 1; i += 1) {
    list.push({ start: values[i], end: values[i + 1] });
  }

  return list;
});
</script>
<template>
  <template v-if="included">
    <Track
      v-if="trackList?.length && (classNames.tracks || styles.tracks)"
      :index="null"
      :prefix-cls="prefixCls"
      :start="trackList[0].start"
      :end="trackList[trackList.length - 1].end"
      :replace-cls="clsx(classNames.tracks, `${prefixCls}-tracks`)"
      :style="styles.tracks"
    />
    <Track
      v-for="({ start, end }, index) in trackList"
      :index="index"
      :prefix-cls="prefixCls"
      :style="{ ...getIndex(style, index), ...styles.track }"
      :start="start"
      :end="end"
      :key="index"
      @start-move="onStartMove"
    />
  </template>
</template>
