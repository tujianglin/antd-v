import raf from '@/vc-util/raf';
import { onBeforeUnmount, shallowRef } from 'vue';

export default function useDelay(callback: VoidFunction) {
  const idRef = shallowRef<number>(0);

  const clearRaf = () => {
    raf.cancel(idRef.value);
  };

  onBeforeUnmount(() => {
    clearRaf();
  });

  const triggerFn = () => {
    clearRaf();
    idRef.value = raf(callback);
  };

  return triggerFn;
}
