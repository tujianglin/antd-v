import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Trigger only when component unmount
 */
export function useUnmount(triggerStart: VoidFunction, triggerEnd: VoidFunction) {
  const firstMount = ref(false);

  onMounted(() => {
    // 第一次挂载时先标记
    firstMount.value = true;

    if (firstMount.value) {
      triggerStart();
    }
  });

  onUnmounted(() => {
    if (firstMount.value) {
      triggerEnd();
      firstMount.value = false;
    }
  });
}
