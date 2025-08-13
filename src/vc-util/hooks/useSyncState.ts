import { ref } from 'vue';
import useEvent from './useEvent';

type Updater<T> = T | ((prevValue: T) => T);

export type SetState<T> = (nextValue: Updater<T>) => void;

/**
 * 同步状态钩子，确保总是获取最新状态
 * 适用于需要同步获取最新状态的场景
 */
export default function useSyncState<T>(defaultValue?: T): [get: () => T, set: SetState<T>] {
  const stateRef = ref<T>(defaultValue as T);
  const triggerRef = ref(0); // 用于强制更新

  const getValue = useEvent(() => {
    return stateRef.value;
  });

  const setValue = useEvent((updater: Updater<T>) => {
    stateRef.value = typeof updater === 'function' ? (updater as (prevValue: T) => T)(stateRef.value) : updater;

    triggerRef.value++; // 触发响应式更新
  });

  return [getValue, setValue];
}
