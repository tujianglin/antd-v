<script lang="tsx" setup>
import Render from '@/vc-component/render';
import { computed, h, nextTick, onBeforeUnmount, ref, toRefs, watch } from 'vue';
import { usePanelContextInject } from '../../context';
import useScrollTo from './useScrollTo';
import clsx from 'clsx';

export type Unit<ValueType = number | string> = {
  label: any;
  value: ValueType;
  disabled?: boolean;
};

export interface TimeUnitColumnProps {
  units: Unit[];
  value: number | string | null;
  optionalValue?: number | string;
  type: 'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem';
  onChange: (value: number | string) => void;
  onHover: (value: number | string) => void;
  onDblClick?: VoidFunction;
  changeOnScroll?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { units, value, optionalValue, type, onChange, onHover, onDblClick, changeOnScroll } = defineProps<TimeUnitColumnProps>();

const { prefixCls, cellRender, now, locale, classNames, styles } = toRefs(usePanelContextInject());

const SCROLL_DELAY = 300;

const panelPrefixCls = computed(() => `${prefixCls.value}-time-panel`);
const cellPrefixCls = computed(() => `${prefixCls.value}-time-panel-cell`);

// ========================== Refs ==========================
const ulRef = ref<HTMLUListElement>(null);

// ========================= Scroll =========================
const checkDelayRef = ref<any>();

const clearDelayCheck = () => {
  clearTimeout(checkDelayRef.value);
};

// ========================== Sync ==========================
const [syncScroll, stopScroll, isScrolling] = useScrollTo(
  ulRef,
  computed(() => value ?? optionalValue),
);

// Not use JSON.stringify to avoid dead loop
function flattenUnits(units: Unit<string | number>[]) {
  return units.map(({ value, label, disabled }) => [value, label, disabled].join(',')).join(';');
}

const flatUnits = computed(() => flattenUnits(units));
// Effect sync value scroll
watch(
  [() => value, () => optionalValue, flatUnits],
  async () => {
    await nextTick();
    setTimeout(() => {
      syncScroll();
    }, 100);
    clearDelayCheck();
  },
  { immediate: true, deep: true, flush: 'post' },
);

onBeforeUnmount(() => {
  stopScroll();
  clearDelayCheck();
});

// ========================= Change =========================
// Scroll event if sync onScroll
const onInternalScroll = (event) => {
  clearDelayCheck();

  const target = event.target as HTMLUListElement;

  if (!isScrolling() && changeOnScroll) {
    checkDelayRef.value = setTimeout(() => {
      const ul = ulRef.value!;
      const firstLiTop = ul.querySelector<HTMLLIElement>(`li`).offsetTop;
      const liList = Array.from(ul.querySelectorAll<HTMLLIElement>(`li`));
      const liTopList = liList.map((li) => li.offsetTop - firstLiTop);
      const liDistList = liTopList.map((top, index) => {
        if (units[index].disabled) {
          return Number.MAX_SAFE_INTEGER;
        }
        return Math.abs(top - target.scrollTop);
      });

      // Find min distance index
      const minDist = Math.min(...liDistList);
      const minDistIndex = liDistList.findIndex((dist) => dist === minDist);
      const targetUnit = units[minDistIndex];
      if (targetUnit && !targetUnit.disabled) {
        onChange(targetUnit.value);
      }
    }, SCROLL_DELAY);
  }
};

// ========================= Render =========================
const columnPrefixCls = computed(() => `${panelPrefixCls.value}-column`);

const Inner = ({ label }) => {
  return (
    <div class={`${cellPrefixCls.value}-inner`}>
      <Render content={label}></Render>
    </div>
  );
};
</script>
<template>
  <ul :class="columnPrefixCls" ref="ulRef" :datatype="type" @scroll="onInternalScroll">
    <li
      v-for="{ label, value: unitValue, disabled } in units"
      :key="unitValue"
      :style="styles.item"
      :class="
        clsx(cellPrefixCls, classNames.item, {
          [`${cellPrefixCls}-selected`]: value === unitValue,
          [`${cellPrefixCls}-disabled`]: disabled,
        })
      "
      @click="
        () => {
          if (!disabled) {
            onChange(unitValue);
          }
        }
      "
      @dblclick="
        () => {
          if (!disabled && onDblClick) {
            onDblClick();
          }
        }
      "
      @mouseenter="
        () => {
          onHover(unitValue);
        }
      "
      @mouseleave="
        () => {
          onHover(null);
        }
      "
      :data-value="unitValue"
    >
      <Render
        v-if="cellRender"
        :content="
          cellRender(unitValue, { prefixCls, originNode: h(Inner, { label }), today: now, type: 'time', subType: type, locale })
        "
      />
      <Inner v-else :label="label" />
    </li>
  </ul>
</template>
