import { ref, watch } from 'vue';

/**
 * Same as `React.useCallback` but always return a memoized function
 * but redirect to real function.
 */
export default function useRefFunc<T extends (...args: any[]) => any>(callback: T): T {
  const funcRef = ref<T>();
  watch(
    () => callback,
    (val) => {
      funcRef.value = val;
    },
    { deep: true, immediate: true },
  );

  const cacheFn = (...args: any[]) => {
    return funcRef.value(...args);
  };

  return cacheFn as any;
}
