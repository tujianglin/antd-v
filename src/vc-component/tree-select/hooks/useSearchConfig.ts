import { reactiveComputed } from '@vueuse/core';
import type { Reactive, Ref } from 'vue';
import type { SearchConfig } from '../TreeSelect.vue';

// Convert `showSearch` to unique config
export default function useSearchConfig(showSearch: Ref<SearchConfig>, props: Reactive<SearchConfig & { inputValue: string }>) {
  return reactiveComputed<[boolean | undefined, SearchConfig]>(() => {
    const { searchValue, inputValue, onSearch, autoClearSearchValue, filterTreeNode, treeNodeFilterProp } = props;
    const isObject = typeof showSearch === 'object';

    const searchConfig: SearchConfig = {
      searchValue: searchValue ?? inputValue,
      onSearch,
      autoClearSearchValue,
      filterTreeNode,
      treeNodeFilterProp,
      ...(isObject ? showSearch : {}),
    };

    return [isObject ? true : showSearch, searchConfig];
  });
}
