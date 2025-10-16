import { onBeforeUnmount, shallowRef } from 'vue';

export default function useDelay() {
  const delayRef = shallowRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDelay = () => {
    if (delayRef.value) {
      clearTimeout(delayRef.value);
      delayRef.value = null;
    }
  };

  const delayInvoke = (callback: VoidFunction, delay: number) => {
    clearDelay();

    if (delay === 0) {
      callback();
    } else {
      delayRef.value = setTimeout(() => {
        callback();
      }, delay * 1000);
    }
  };

  // Clean up on unmount
  onBeforeUnmount(() => {
    clearDelay();
  });

  return delayInvoke;
}
