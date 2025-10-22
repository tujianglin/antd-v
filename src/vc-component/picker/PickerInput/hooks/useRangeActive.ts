import { computed, ref, watch, type Ref } from 'vue';
import type { RangeValueType } from '../RangePicker.vue';
import useLockEffect from './useLockEffect';

export type OperationType = 'input' | 'panel';

export type NextActive = (nextValue: RangeValueType) => number | null;

/**
 * When user first focus one input, any submit will trigger focus another one.
 * When second time focus one input, submit will not trigger focus again.
 * When click outside to close the panel, trigger event if it can trigger onChange.
 */
export default function useRangeActive(
  disabled: Ref<boolean[]>,
  empty: Ref<boolean[]> = ref([]),
  mergedOpen: Ref<boolean> = ref(false),
): [
  focused: Ref<boolean>,
  triggerFocus: (focused: boolean) => void,
  lastOperation: (type?: OperationType) => OperationType,
  activeIndex: Ref<number>,
  nextActiveIndex: NextActive,
  activeListRef: Ref<number[]>,
  updateSubmitIndex: (index: number | null) => void,
  hasActiveSubmitValue: (index: number) => boolean,
] {
  const activeIndex = ref(0);
  const focused = ref<boolean>(false);

  const activeListRef = ref<number[]>([]);
  const submitIndexRef = ref<number | null>(null);
  const lastOperationRef = ref<OperationType>(null);

  const updateSubmitIndex = (index: number | null) => {
    submitIndexRef.value = index;
  };

  const hasActiveSubmitValue = (index: number) => {
    return submitIndexRef.value === index;
  };

  const triggerFocus = (nextFocus: boolean) => {
    focused.value = nextFocus;
  };

  // ============================= Record =============================
  const lastOperation = (type?: OperationType) => {
    if (type) {
      lastOperationRef.value = type;
    }
    return lastOperationRef.value;
  };

  // ============================ Strategy ============================
  // Trigger when input enter or input blur or panel close
  const nextActiveIndex: NextActive = (nextValue: RangeValueType) => {
    const list = activeListRef.value;
    const filledActiveSet = new Set(list.filter((index) => nextValue[index] || empty.value[index]));
    const nextIndex = list[list.length - 1] === 0 ? 1 : 0;
    if (filledActiveSet.size >= 2 || disabled.value[nextIndex]) {
      return null;
    }
    return nextIndex;
  };

  // ============================= Effect =============================
  // Wait in case it's from the click outside to blur
  useLockEffect(
    computed(() => focused.value || mergedOpen.value),
    () => {
      if (!focused.value) {
        activeListRef.value = [];
        updateSubmitIndex(null);
      }
    },
  );

  watch([focused, activeIndex], () => {
    if (focused.value) {
      activeListRef.value.push(activeIndex.value);
    }
  });

  return [
    focused,
    triggerFocus,
    lastOperation,
    activeIndex,
    nextActiveIndex,
    activeListRef,
    updateSubmitIndex,
    hasActiveSubmitValue,
  ];
}
