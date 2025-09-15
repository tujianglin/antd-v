import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useLayoutEffect } from './useLayoutEffect';

/**
 * Similar to `useState` but will use props value if provided.
 * From React 18, we do not need safe `useState` since it will not throw for unmounted update.
 * This hooks remove the `onChange` & `postState` logic since we only need basic merged state logic.
 */
export default function useControlledState<T>(defaultStateValue: T, value?: Ref<T>): [ComputedRef<T>, (val: T) => void] {
  const innerValue = ref<T>(defaultStateValue);

  const mergedValue = computed(() => (value?.value !== undefined ? value?.value : innerValue.value));

  useLayoutEffect(
    (mount) => {
      if (!mount) {
        innerValue.value = value.value;
      }
    },
    [value],
  );

  function setInnerValue(value: T) {
    innerValue.value = value;
  }

  return [mergedValue, setInnerValue];
}
