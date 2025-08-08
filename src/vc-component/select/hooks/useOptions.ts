import { computed, type Ref, type Slot, type VNode } from 'vue';
import type { FieldNames, RawValueType } from '../interface';
import { convertChildrenToData } from '../utils/legacyUtil';

/**
 * Parse `children` to `options` if `options` is not provided.
 * Then flatten the `options`.
 */
const useOptions = <OptionType>(
  options: Ref<OptionType[]>,
  children: Ref<Slot>,
  fieldNames: Ref<FieldNames>,
  optionFilterProp: Ref<string>,
  optionLabelProp: Ref<string>,
) => {
  return computed(() => {
    let mergedOptions = options.value;
    const childrenAsData = !options.value;
    if (childrenAsData) {
      mergedOptions = convertChildrenToData(children.value?.());
    }

    const valueOptions = new Map<RawValueType, OptionType>();
    const labelOptions = new Map<VNode, OptionType>();

    const setLabelOptions = (labelOptionsMap: Map<VNode, OptionType>, option: OptionType, key: string | number) => {
      if (key && typeof key === 'string') {
        labelOptionsMap.set(option[key], option);
      }
    };

    const dig = (optionList: OptionType[], isChildren = false) => {
      // for loop to speed up collection speed
      for (let i = 0; i < optionList.length; i += 1) {
        const option = optionList[i];
        if (!option[fieldNames.value.options] || isChildren) {
          valueOptions.set(option[fieldNames.value.value], option);
          setLabelOptions(labelOptions, option, fieldNames.value.label);
          // https://github.com/ant-design/ant-design/issues/35304
          setLabelOptions(labelOptions, option, optionFilterProp?.value);
          setLabelOptions(labelOptions, option, optionLabelProp?.value);
        } else {
          dig(option[fieldNames.value.options], true);
        }
      }
    };

    dig(mergedOptions);
    return {
      options: mergedOptions,
      valueOptions,
      labelOptions,
    };
  });
};

export default useOptions;
