<script lang="tsx" setup>
import { cloneElement } from '@/vc-util/Children/util';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { StatisticProps } from './Statistic.vue';
import Statistic from './Statistic.vue';
import type { FormatConfig, valueType } from './utils';
import { formatCounter } from './utils';

export type TimerType = 'countdown' | 'countup';

export interface StatisticTimerProps extends FormatConfig, StatisticProps {
  type: TimerType;
  format?: string;
  /**
   * Only to be called when the type is `countdown`.
   */
  onFinish?: () => void;
  onChange?: (value?: valueType) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { value, format = 'HH:mm:ss', onChange, onFinish, type, ...rest } = defineProps<StatisticTimerProps>();

function getTime(value?: valueType) {
  return new Date(value as valueType).getTime();
}

const UPDATE_INTERVAL = 1000 / 60;

const down = type === 'countdown';

// We reuse state here to do same as `forceUpdate`
const showTime = ref<null | object>(null);

// ======================== Update ========================
const update = () => {
  const now = Date.now();
  const timestamp = getTime(value);

  showTime.value = {};
  const timeDiff = !down ? now - timestamp : timestamp - now;

  onChange?.(timeDiff);

  // Only countdown will trigger `onFinish`
  if (down && timestamp < now) {
    onFinish?.();
    return false;
  }
  return true;
};

// Effect trigger
let intervalId;
watch(
  [() => value, () => down],
  () => {
    const tick = () => {
      if (!update()) {
        clearInterval(intervalId);
      }
    };

    const startTimer = () => {
      intervalId = setInterval(tick, UPDATE_INTERVAL);
    };

    startTimer();
  },
  { immediate: true },
);

onMounted(() => {
  showTime.value = {};
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});

// ======================== Format ========================
const formatter: StatisticProps['formatter'] = (formatValue, config) =>
  showTime.value ? formatCounter(formatValue, { ...config, format }, down) : '-';

const valueRender: StatisticProps['valueRender'] = (node) => cloneElement(node, { title: undefined });
</script>
<template>
  <Statistic v-bind="rest" :value="value" :value-render="valueRender" :formatter="formatter" />
</template>
