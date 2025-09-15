import { computed, type Ref, type VNode } from 'vue';
import type { DefaultOptionType, FieldNames, SelectProps } from '../interface';
import { toArray } from '../utils/commonUtil';
import { injectPropsWithOption } from '../utils/valueUtil';

function includes(test: VNode, search: string) {
  return toArray(test).join('').toUpperCase().includes(search);
}

export default (
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<FieldNames>,
  searchValue?: Ref<string>,
  filterOption?: Ref<SelectProps['showSearch']['filterOption']>,
  optionFilterProp?: Ref<string>,
) =>
  computed(() => {
    if (!searchValue.value || filterOption.value === false) {
      return options.value;
    }

    const { options: fieldOptions, label: fieldLabel, value: fieldValue } = fieldNames.value;
    const filteredOptions: DefaultOptionType[] = [];

    const customizeFilter = typeof filterOption.value === 'function';

    const upperSearch = searchValue.value.toUpperCase();
    const filterFunc = customizeFilter
      ? (filterOption.value as any)
      : (_: string, option: DefaultOptionType) => {
          // Use provided `optionFilterProp`
          if (optionFilterProp?.value) {
            return includes(option[optionFilterProp?.value], upperSearch);
          }

          // Auto select `label` or `value` by option type
          if (option[fieldOptions]) {
            // hack `fieldLabel` since `OptionGroup` children is not `label`
            return includes(option[fieldLabel !== 'children' ? fieldLabel : 'label'], upperSearch);
          }

          return includes(option[fieldValue], upperSearch);
        };

    const wrapOption: (opt: DefaultOptionType) => DefaultOptionType = customizeFilter
      ? (opt) => injectPropsWithOption(opt)
      : (opt) => opt;

    options.value.forEach((item) => {
      // Group should check child options
      if (item[fieldOptions]) {
        // Check group first
        const matchGroup = filterFunc(searchValue.value, wrapOption(item));
        if (matchGroup) {
          filteredOptions.push(item);
        } else {
          // Check option
          const subOptions = item[fieldOptions].filter((subItem: DefaultOptionType) =>
            filterFunc(searchValue.value, wrapOption(subItem)),
          );
          if (subOptions.length) {
            filteredOptions.push({
              ...item,
              [fieldOptions]: subOptions,
            });
          }
        }

        return;
      }

      if (filterFunc(searchValue.value, wrapOption(item))) {
        filteredOptions.push(item);
      }
    });
    return filteredOptions;
  });
