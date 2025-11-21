import { computed, type ComputedRef } from 'vue';
import type { DefaultOptionType, SearchConfig, SelectProps } from '../interface';

// Convert `showSearch` to unique config
export default function useSearchConfig(
  showSearch: ComputedRef<boolean | SearchConfig<DefaultOptionType> | undefined>,
  mode: ComputedRef<SelectProps<DefaultOptionType>['mode']>,
) {
  const result = computed<[boolean | undefined, SearchConfig<DefaultOptionType>]>(() => {
    const isObject = typeof showSearch?.value === 'object';
    const searchConfig = {
      ...(isObject ? showSearch?.value : {}),
    };

    return [
      isObject ||
      mode?.value === 'combobox' ||
      mode?.value === 'tags' ||
      (mode?.value === 'multiple' && showSearch?.value === undefined)
        ? true
        : showSearch?.value,
      searchConfig,
    ];
  });
  return [computed(() => result?.value?.[0]), computed(() => result?.value?.[1])] as const;
}
