import warning from '@/vc-util/warning';
import { reactiveComputed } from '@vueuse/core';
import { toRefs, type Reactive, type Ref } from 'vue';
import type { CascaderProps, SearchConfig } from '../Cascader.vue';

// Convert `showSearch` to unique config
export default function useSearchConfig(showSearch?: Ref<CascaderProps['showSearch']>, props?: Reactive<any>) {
  const { autoClearSearchValue, searchValue, onSearch } = toRefs(props);
  return reactiveComputed(() => {
    if (!showSearch.value) {
      return { mergedShowSearch: false, searchConfig: {} };
    }

    let searchConfig: SearchConfig = {
      matchInputWidth: true,
      limit: 50,
      autoClearSearchValue: autoClearSearchValue.value,
      searchValue: searchValue.value,
      onSearch: onSearch.value,
    };

    if (showSearch.value && typeof showSearch.value === 'object') {
      searchConfig = {
        ...searchConfig,
        ...showSearch.value,
      };
    }

    if ((searchConfig.limit as number) <= 0) {
      searchConfig.limit = false;

      if (process.env.NODE_ENV !== 'production') {
        warning(false, "'limit' of showSearch should be positive number or false.");
      }
    }

    return { mergedShowSearch: true, searchConfig };
  });
}
