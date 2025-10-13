import { computed, type Ref } from 'vue';
import type { PaginationProps } from '.';
import type { SelectProps } from '../select';

export default function useShowSizeChanger(showSizeChanger?: Ref<PaginationProps['showSizeChanger']>) {
  const value = computed<[show: boolean | undefined, selectProps: SelectProps | undefined]>(() => {
    if (typeof showSizeChanger.value === 'boolean') {
      return [showSizeChanger.value, {}];
    }

    if (showSizeChanger.value && typeof showSizeChanger.value === 'object') {
      return [true, showSizeChanger.value];
    }

    return [undefined, undefined];
  });
  return [
    computed(() => value.value[0] as unknown as boolean | undefined),
    computed(() => value.value[1] as unknown as boolean | undefined),
  ];
}
