import { onUnmounted, onUpdated, ref } from 'vue';

/**
 * 保持回调函数引用始终最新，同时保持稳定的函数标识
 * @param callback 需要保持最新的回调函数
 * @returns 稳定的函数引用，但内部总是调用最新的回调
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function useEvent<T extends Function>(callback: T): T {
  const callbackRef = ref<T>(callback);

  // 确保回调始终是最新的
  onUpdated(() => {
    callbackRef.value = callback;
  });

  // 组件卸载时清空引用
  onUnmounted(() => {
    callbackRef.value = null as unknown as T;
  });

  // 返回一个稳定的函数包装器
  const stableWrapper = (...args: any[]) => {
    return callbackRef.value?.(...args);
  };

  return stableWrapper as unknown as T;
}
