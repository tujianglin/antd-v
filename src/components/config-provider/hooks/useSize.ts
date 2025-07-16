import { computed } from 'vue';
import { useSizeContextInject, type SizeType } from '../SizeContext';

const useSize = <T extends string | undefined | number | object>(customSize?: T | ((ctxSize: SizeType) => T)): T => {
  const { size } = useSizeContextInject();
  const mergedSize = computed(() => {
    if (!customSize) {
      return size as T;
    }
    if (typeof customSize === 'string') {
      return customSize ?? size;
    }
    if (typeof customSize === 'function') {
      return customSize(size.value);
    }
    return size as T;
  });
  return mergedSize.value;
};

export default useSize;
