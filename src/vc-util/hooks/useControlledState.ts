import { computed, nextTick, ref, watch, type Ref } from 'vue';

/**
 * Similar to `useState` but will use props value if provided.
 * From React 18, we do not need safe `useState` since it will not throw for unmounted update.
 * This hooks remove the `onChange` & `postState` logic since we only need basic merged state logic.
 */
export default function useControlledState<T>(defaultStateValue: Ref<T>, value?: Ref<T>): Ref<T> {
  const innerValue = ref<T>(defaultStateValue.value);

  const mergedValue = computed(() => (value !== undefined ? value : innerValue.value));

  watch(
    value,
    async () => {
      await nextTick();
      innerValue.value = value;
    },
    { immediate: true, flush: 'post' },
  );

  return mergedValue;
}
