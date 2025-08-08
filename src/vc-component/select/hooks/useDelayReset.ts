import { onBeforeUnmount, ref, type Ref } from 'vue';

/**
 * Similar with `useLock`, but this hook will always execute last value.
 * When set to `true`, it will keep `true` for a short time even if `false` is set.
 */
export default function useDelayReset(
  timeout: number = 10,
): [Ref<boolean>, (val: boolean, callback?: () => void) => void, () => void] {
  const bool = ref<boolean>(false);
  const delayRef = ref<number>(null);

  const cancelLatest = () => {
    window.clearTimeout(delayRef.value);
  };

  onBeforeUnmount(() => {
    cancelLatest();
  });

  const delaySetBool = (value: boolean, callback?: () => void) => {
    cancelLatest();

    if (value === true) {
      // true 值立即设置
      bool.value = true;
      callback?.();
    } else {
      // false 值延迟设置
      delayRef.value = window.setTimeout(() => {
        bool.value = false;
        callback?.();
      }, timeout);
    }
  };

  return [bool, delaySetBool, cancelLatest];
}
