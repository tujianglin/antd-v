import raf from '@/vc-util/raf';
import { onBeforeUnmount, ref, watch, type Ref } from 'vue';

/**
 * Trigger `callback` immediately when `condition` is `true`.
 * But trigger `callback` in next frame when `condition` is `false`.
 */
export default function useLockEffect(condition: Ref<boolean>, callback: (next: boolean) => void, delayFrames = 1) {
  const callbackRef = ref(callback);
  callbackRef.value = callback;
  let id;
  watch(
    condition,
    () => {
      if (condition) {
        callbackRef.value(condition.value);
      } else {
        id = raf(() => {
          callbackRef.value(condition.value);
        }, delayFrames);
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    raf.cancel(id);
  });
}
