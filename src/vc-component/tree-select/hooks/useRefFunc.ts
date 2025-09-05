import { ref } from 'vue';

/**
 * Same as `React.useCallback` but always return a memoized function
 * but redirect to real function.
 */
export default function useRefFunc<T extends (...args: any[]) => any>(callback: T): T {
  const funcRef = ref<T>();
  funcRef.value = callback;

  const cacheFn = (...args: any[]) => {
    return funcRef.value(...args);
  };

  return cacheFn as any;
}
