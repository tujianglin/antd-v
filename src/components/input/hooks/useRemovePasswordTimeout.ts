import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

export function useRemovePasswordTimeout(inputRef: Ref<HTMLInputElement | null>, triggerOnMount = false) {
  const removePasswordTimeoutRef = ref<ReturnType<typeof setTimeout>[]>([]);

  const removePasswordTimeout = () => {
    const timer = setTimeout(() => {
      const inputEl = inputRef.value;
      if (inputEl && inputEl.getAttribute('type') === 'password' && inputEl.hasAttribute('value')) {
        inputEl.removeAttribute('value');
      }
    });

    removePasswordTimeoutRef.value.push(timer);
  };

  onMounted(() => {
    if (triggerOnMount) {
      removePasswordTimeout();
    }
  });

  onBeforeUnmount(() => {
    removePasswordTimeoutRef.value.forEach((timer) => {
      clearTimeout(timer);
    });
    removePasswordTimeoutRef.value = [];
  });

  return removePasswordTimeout;
}
