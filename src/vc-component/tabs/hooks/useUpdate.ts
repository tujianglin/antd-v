import { nextTick, ref, watch, type Ref } from 'vue';

/**
 * Help to merge callback with `useLayoutEffect`.
 * One time will only trigger once.
 */
export default function useUpdate(callback: VoidFunction): () => void {
  const count = ref(0);
  const effectRef = ref(0);
  const callbackRef = ref<VoidFunction>();
  callbackRef.value = callback;

  watch(
    count,
    async () => {
      await nextTick();
      callbackRef.value?.();
    },
    { immediate: true, flush: 'post' },
  );

  // Trigger to update count
  return () => {
    if (effectRef.value !== count.value) {
      return;
    }

    effectRef.value += 1;
    count.value = effectRef.value;
  };
}

type Callback<T> = (ori: T) => T;

export function useUpdateState<T>(defaultState: T | (() => T)): [Ref<T>, (updater: Callback<T>) => void] {
  const batchRef = ref<Callback<T>[]>([]);
  const forceUpdate = ref({});
  const state = ref<T>(typeof defaultState === 'function' ? (defaultState as any)() : defaultState);

  const flushUpdate = useUpdate(() => {
    let current = state.value;
    batchRef.value.forEach((callback) => {
      current = callback(current);
    });
    batchRef.value = [];

    state.value = current;
    forceUpdate.value = {};
  });

  function updater(callback: Callback<T>) {
    batchRef.value.push(callback);
    flushUpdate();
  }

  return [state as Ref<T>, updater];
}
