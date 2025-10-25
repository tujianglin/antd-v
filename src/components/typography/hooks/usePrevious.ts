import { ref, watchEffect } from 'vue';

const usePrevious = <T>(value: T): T | undefined => {
  const dom = ref<T>(undefined);
  watchEffect(() => {
    dom.value = value;
  });
  return dom.value;
};

export default usePrevious;
