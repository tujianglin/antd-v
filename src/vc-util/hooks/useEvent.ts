import { ref } from 'vue';

export function useEvent<T extends (...args: any[]) => any>(fn: T): T {
  const fnRef = ref(fn);

  // 始终更新最新函数
  fnRef.value = fn;

  const stableFn = ((...args: any[]) => {
    return fnRef.value(...args);
  }) as T;

  return stableFn;
}
