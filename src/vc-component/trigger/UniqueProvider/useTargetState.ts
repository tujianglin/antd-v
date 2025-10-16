import { ref, shallowRef, type Ref } from 'vue';
import type { UniqueShowOptions } from '../context';

/**
 * Control the state of popup bind target:
 * 1. When set `target`. Do show the popup.
 * 2. When `target` is removed. Do hide the popup.
 * 3. When `target` change to another one:
 *  a. We wait motion finish of previous popup.
 *  b. Then we set new target and show the popup.
 * 4. During appear/enter animation, cache new options and apply after animation completes.
 */
export default function useTargetState(): [
  trigger: (options: UniqueShowOptions | false) => void,
  open: Ref<boolean>,
  /* Will always cache last which is not null */
  cacheOptions: Ref<UniqueShowOptions | null>,
  onVisibleChanged: (visible: boolean) => void,
] {
  const options = ref<UniqueShowOptions | null>(null);
  const open = ref(false);
  const isAnimating = ref(false);
  const pendingOptionsRef = shallowRef<UniqueShowOptions | null>(null);

  const trigger = (nextOptions: UniqueShowOptions | false) => {
    if (nextOptions === false) {
      // Clear pending options when hiding
      pendingOptionsRef.value = null;
      open.value = false;
    } else {
      if (isAnimating.value && open.value) {
        // If animating (appear or enter), cache new options
        pendingOptionsRef.value = nextOptions;
      } else {
        open.value = true;
        // Set new options
        options.value = nextOptions;
        pendingOptionsRef.value = null;

        // Only mark as animating when transitioning from closed to open
        if (!open.value) {
          isAnimating.value = true;
        }
      }
    }
  };

  const onVisibleChanged = (visible: boolean) => {
    if (visible) {
      // Animation enter completed, check if there are pending options
      isAnimating.value = false;
      if (pendingOptionsRef.value) {
        // Apply pending options
        options.value = pendingOptionsRef.value;
        pendingOptionsRef.value = null;
      }
    } else {
      // Animation leave completed
      isAnimating.value = false;
      pendingOptionsRef.value = null;
    }
  };

  return [trigger, open, options, onVisibleChanged] as const;
}
