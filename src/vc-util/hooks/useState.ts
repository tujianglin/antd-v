import { onMounted, onUnmounted, ref, type Ref } from 'vue';

type Updater<T> = T | ((prevValue: T) => T);

export type SetState<T> = (
  nextValue: Updater<T>,
  /**
   * Will not update state when destroyed.
   * Developer should make sure this is safe to ignore.
   */
  ignoreDestroy?: boolean,
) => void;

/**
 * Similar to React's useState but `setState` accepts `ignoreDestroy` param
 * to avoid updating state after component is destroyed.
 */
export default function useSafeState<T>(defaultValue?: T | (() => T)): [Ref<T>, SetState<T>] {
  const destroyed = ref(false);
  const state = ref<T>(typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue) as Ref<T>;

  onMounted(() => {
    destroyed.value = false;
  });

  onUnmounted(() => {
    destroyed.value = true;
  });

  function safeSetState(updater: Updater<T>, ignoreDestroy?: boolean) {
    if (ignoreDestroy && destroyed.value) {
      return;
    }

    if (typeof updater === 'function') {
      state.value = (updater as (prevValue: T) => T)(state.value);
    } else {
      state.value = updater;
    }
  }

  return [state, safeSetState];
}
