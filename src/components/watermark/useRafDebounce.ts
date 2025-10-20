import raf from '@/vc-util/raf';
import { shallowRef } from 'vue';

/**
 * Callback will only execute last one for each raf
 */
export default function useRafDebounce(callback: VoidFunction) {
  const executeRef = shallowRef(false);
  const rafRef = shallowRef<number>(null);

  const wrapperCallback = callback;

  return () => {
    if (executeRef.value) {
      return;
    }

    executeRef.value = true;
    wrapperCallback();

    rafRef.value = raf(() => {
      executeRef.value = false;
    });
  };
}
