import { onBeforeUnmount, ref } from 'vue';
import type { MotionEvent } from '../interface';
import { animationEndName, transitionEndName } from '../util/motion';

export default (
  onInternalMotionEnd: (event: MotionEvent) => void,
): [(element: HTMLElement) => void, (element: HTMLElement) => void] => {
  const cacheElementRef = ref<HTMLElement>();

  // Remove events
  function removeMotionEvents(element: HTMLElement) {
    if (element) {
      element.removeEventListener(transitionEndName, onInternalMotionEnd);
      element.removeEventListener(animationEndName, onInternalMotionEnd);
    }
  }

  // Patch events
  function patchMotionEvents(element: HTMLElement) {
    if (cacheElementRef.value && cacheElementRef.value !== element) {
      removeMotionEvents(cacheElementRef.value);
    }

    if (element && element !== cacheElementRef.value) {
      element.addEventListener(transitionEndName, onInternalMotionEnd);
      element.addEventListener(animationEndName, onInternalMotionEnd);

      // Save as cache in case dom removed trigger by `motionDeadline`
      cacheElementRef.value = element;
    }
  }

  // Clean up when removed
  onBeforeUnmount(() => {
    removeMotionEvents(cacheElementRef.value);
  });

  return [patchMotionEvents, removeMotionEvents];
};
