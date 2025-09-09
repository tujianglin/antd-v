import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import type { InputRef } from '../../../vc-component/input';

export function useRemovePasswordTimeout(inputRef: Ref<InputRef | null>, triggerOnMount = false) {
  const removePasswordTimeoutRef = ref<ReturnType<typeof setTimeout>[]>([]);

  const removePasswordTimeout = () => {
    removePasswordTimeoutRef.value.push(
      setTimeout(() => {
        if (
          inputRef.value?.input &&
          inputRef.value?.input.getAttribute('type') === 'password' &&
          inputRef.value?.input.hasAttribute('value')
        ) {
          inputRef.value?.input.removeAttribute('value');
        }
      }),
    );
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
