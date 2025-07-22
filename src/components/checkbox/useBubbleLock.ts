import raf from '@/vc-util/raf';
import { ref } from 'vue';

/**
 * When click on the label,
 * the event will be stopped to prevent the label from being clicked twice.
 * label click -> input click -> label click again
 */
export default function useBubbleLock(onOriginInputClick?: (e: MouseEvent) => void) {
  const labelClickLockRef = ref<number | null>(null);

  const clearLock = () => {
    raf.cancel(labelClickLockRef.value!);
    labelClickLockRef.value = null;
  };

  const onLabelClick = () => {
    clearLock();

    labelClickLockRef.value = raf(() => {
      labelClickLockRef.value = null;
    });
  };

  const onInputClick = (e) => {
    if (labelClickLockRef.value) {
      e.stopPropagation();
      clearLock();
    }

    onOriginInputClick?.(e);
  };

  return [onLabelClick, onInputClick] as const;
}
