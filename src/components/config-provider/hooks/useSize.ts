import { computed, type ComputedRef, type Ref } from 'vue';
import { useSizeContextInject, type SizeType } from '../SizeContext';

const useSize = <T extends string | undefined | number | object>(
  customSize?: Ref<T | ((ctxSize: SizeType) => T)>,
): ComputedRef<T> => {
  const size = useSizeContextInject();
  const mergedSize = computed<T>(() => {
    if (!customSize.value) {
      return size.value as T;
    }
    if (typeof customSize.value === 'string') {
      return customSize.value ?? size.value;
    }
    if (typeof customSize.value === 'function') {
      return customSize.value(size.value);
    }
    return size.value as T;
  });
  return mergedSize;
};

export default useSize;
