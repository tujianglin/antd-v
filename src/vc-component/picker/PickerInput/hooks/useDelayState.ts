import useControlledState from '@/vc-util/hooks/useControlledState';
import raf from '@/vc-util/raf';
import { onBeforeUnmount, ref, type Ref } from 'vue';

/**
 * Will be `true` immediately for next effect.
 * But will be `false` for a delay of effect.
 */
export default function useDelayState<T>(
  value: Ref<T>,
  onChange?: (next: T) => void,
): [state: Ref<T>, setState: (nextState: T, immediately?: boolean) => void] {
  const [state, setState] = useControlledState<T>(value.value, undefined);

  const nextValueRef = ref<T>(value.value);

  // ============================= Update =============================
  const rafRef = ref<number>();
  const cancelRaf = () => {
    raf.cancel(rafRef.value);
  };
  const doUpdate = () => {
    setState(nextValueRef.value);

    if (onChange && state.value !== nextValueRef.value) {
      onChange?.(nextValueRef.value);
    }
  };

  const updateValue = (next: T, immediately?: boolean) => {
    cancelRaf();

    nextValueRef.value = next;

    if (next || immediately) {
      doUpdate();
    } else {
      rafRef.value = raf(doUpdate);
    }
  };

  onBeforeUnmount(() => {
    cancelRaf();
  });

  return [state, updateValue];
}
