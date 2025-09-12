import raf from '@/vc-util/raf';
import { onBeforeUnmount, ref, type Ref } from 'vue';

export default function useRafLock(): [state: Ref<boolean>, setState: (nextState: boolean) => void] {
  const state = ref(false);

  const rafRef = ref<number>(null);
  const cleanup = () => {
    raf.cancel(rafRef.value!);
  };

  const setDelayState = (nextState: boolean) => {
    cleanup();

    if (nextState) {
      state.value = nextState;
    } else {
      rafRef.value = raf(() => {
        state.value = nextState;
      });
    }
  };

  onBeforeUnmount(() => {
    cleanup();
  });

  return [state, setDelayState];
}
