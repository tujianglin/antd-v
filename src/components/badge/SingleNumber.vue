<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';

export interface UnitNumberProps {
  prefixCls: string;
  value: string | number;
  offset?: number;
  current?: boolean;
}

export interface SingleNumberProps {
  prefixCls: string;
  value: string;
  count: number;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, count: originCount, value: originValue } = defineProps<SingleNumberProps>();

const UnitNumber = (props: Partial<UnitNumberProps>) => {
  const { prefixCls, value, current, offset = 0 } = props;
  let style: CSSProperties | undefined;
  if (offset) {
    style = { position: 'absolute', top: `${offset}00%`, left: 0 };
  }
  return (
    <span style={style} class={clsx(`${prefixCls}-only-unit`, { current })}>
      {value}
    </span>
  );
};

function getOffset(start: number, end: number, unit: -1 | 1) {
  let index = start;
  let offset = 0;

  while ((index + 10) % 10 !== end) {
    index += unit;
    offset += unit;
  }

  return offset;
}

const value = computed(() => Number(originValue));
const count = computed(() => Math.abs(originCount));
const prevValue = ref(value.value);
const prevCount = ref(count.value);

// ============================= Events =============================
const onTransitionEnd = () => {
  prevValue.value = value.value;
  prevCount.value = count.value;
};

// Fallback if transition events are not supported
let timer;
watch(
  value,
  () => {
    timer = setTimeout(onTransitionEnd, 1000);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearTimeout(timer);
});

// ============================= Render =============================
// Render unit list
const offsetStyle = computed(() => {
  if (prevValue.value === value.value || Number.isNaN(value) || Number.isNaN(prevValue)) {
    return { transition: 'none' };
  } else {
    const unit = prevCount.value < count.value ? 1 : -1;
    return { transform: `translateY(${-getOffset(prevValue.value, value.value, unit)}00%)` };
  }
});
const vm = getCurrentInstance();
const UnitNodes = () => {
  let result;
  if (prevValue.value === value.value || Number.isNaN(value) || Number.isNaN(prevValue)) {
    result = [<UnitNumber {...vm.props} key={value.value} current />];
  } else {
    result = [];
    const end = value.value + 10;
    const unitNumberList: number[] = [];
    for (let index = value.value; index <= end; index += 1) {
      unitNumberList.push(index);
    }

    const unit = prevCount.value < count.value ? 1 : -1;

    // Fill with number unit nodes
    const prevIndex = unitNumberList.findIndex((n) => n % 10 === prevValue.value);

    // Cut list
    const cutUnitNumberList = unit < 0 ? unitNumberList.slice(0, prevIndex + 1) : unitNumberList.slice(prevIndex);

    result = cutUnitNumberList.map((n, index) => {
      const singleUnit = n % 10;
      return (
        <UnitNumber
          {...vm.props}
          key={n}
          value={singleUnit}
          offset={unit < 0 ? index - prevIndex : index}
          current={index === prevIndex}
        />
      );
    });
  }
  return result;
};
</script>
<template>
  <span :class="`${prefixCls}-only`" :style="offsetStyle" @transitionend="onTransitionEnd">
    <UnitNodes />
  </span>
</template>
