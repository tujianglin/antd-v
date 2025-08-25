import { computed, type Reactive, type Ref } from 'vue';
import type { DefaultOptionType, InternalFieldNames, SearchConfig } from '../Cascader.vue';

export const SEARCH_MARK = '__rc_cascader_search_mark__';

const defaultFilter: SearchConfig['filter'] = (search, options, { label = '' }) =>
  options.some((opt) => String(opt[label]).toLowerCase().includes(search.toLowerCase()));

const defaultRender: SearchConfig['render'] = (_inputValue, path, _prefixCls, fieldNames) =>
  path.map((opt) => opt[fieldNames.label as string]).join(' / ');

const useSearchOptions = (
  search: Ref<string>,
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
  prefixCls: Ref<string>,
  config: Reactive<SearchConfig>,
  enableHalfPath?: Ref<boolean>,
) => {
  const filter = computed(() => config.filter || defaultFilter);
  const render = computed(() => config.render || defaultRender);
  const limit = computed<number | false>(() => config.limit || 50);
  const sort = computed(() => config.sort);
  return computed(() => {
    const filteredOptions: DefaultOptionType[] = [];
    if (!search.value) {
      return [];
    }

    function dig(list: DefaultOptionType[], pathOptions: DefaultOptionType[], parentDisabled = false) {
      list.forEach((option) => {
        // Perf saving when `sort` is disabled and `limit` is provided
        if (!sort.value && limit.value !== false && limit.value > 0 && filteredOptions.length >= limit.value) {
          return;
        }

        const connectedPathOptions = [...pathOptions, option];
        const children = option[fieldNames.value.children];

        const mergedDisabled = parentDisabled || option.disabled;

        // If current option is filterable
        if (
          // If is leaf option
          !children ||
          children.length === 0 ||
          // If is changeOnSelect or multiple
          enableHalfPath
        ) {
          if (filter.value(search.value, connectedPathOptions, { label: fieldNames.value.label })) {
            filteredOptions.push({
              ...option,
              disabled: mergedDisabled,
              [fieldNames.value.label as 'label']: render.value(
                search.value,
                connectedPathOptions,
                prefixCls.value,
                fieldNames.value,
              ),
              [SEARCH_MARK]: connectedPathOptions,
              [fieldNames.value.children]: undefined,
            });
          }
        }

        if (children) {
          dig(option[fieldNames.value.children] as DefaultOptionType[], connectedPathOptions, mergedDisabled);
        }
      });
    }

    dig(options.value, []);

    // Do sort
    if (sort.value) {
      filteredOptions.sort((a, b) => {
        return sort.value(a[SEARCH_MARK], b[SEARCH_MARK], search.value, fieldNames.value);
      });
    }

    return limit.value !== false && limit.value > 0 ? filteredOptions.slice(0, limit.value as number) : filteredOptions;
  });
};

export default useSearchOptions;
