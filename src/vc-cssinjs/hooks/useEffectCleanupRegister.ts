import { warning } from '@/vc-util';
import { onUnmounted, ref, watch, type WatchSource } from 'vue';

/**
 * DO NOT register functions in cleanup function, or functions that registered will never be called.
 */
const useEffectCleanupRegister = (deps?: WatchSource[]) => {
  const effectCleanups: (() => void)[] = [];
  const cleanupFlag = ref(false);

  function register(fn: () => void) {
    if (cleanupFlag.value) {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          false,
          '[Ant Design CSS-in-JS] You are registering a cleanup function after unmount, which will not have any effect.',
        );
      }
      return;
    }
    effectCleanups.push(fn);
  }

  if (deps && deps.length > 0) {
    watch(
      deps,
      () => {
        cleanupFlag.value = false;
      },
      { immediate: true },
    );
  }

  onUnmounted(() => {
    cleanupFlag.value = true;
    if (effectCleanups.length) {
      effectCleanups.forEach((fn) => fn());
    }
  });

  return register;
};

export default useEffectCleanupRegister;
