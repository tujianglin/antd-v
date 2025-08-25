import { isValidElement } from '@/components/_util/isValidNode';
import { cloneVNode, computed, type Ref } from 'vue';
import type { CascaderProps, DefaultOptionType, InternalFieldNames, SingleValueType } from '../Cascader.vue';
import { toPathKey } from '../utils/commonUtil';
import { toPathOptions } from '../utils/treeUtil';

export default (
  rawValues: Ref<SingleValueType[]>,
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
  multiple: Ref<boolean>,
  displayRender: CascaderProps['displayRender'],
) => {
  return computed(() => {
    const mergedDisplayRender =
      displayRender ||
      // Default displayRender
      ((labels) => {
        const mergedLabels: any[] = multiple.value ? labels.slice(-1) : labels;
        const SPLIT = ' / ';

        if (mergedLabels.every((label) => ['string', 'number'].includes(typeof label))) {
          return mergedLabels.join(SPLIT);
        }

        // If exist non-string value, use ReactNode instead
        return mergedLabels.reduce((list: any[], label, index) => {
          const keyedLabel = isValidElement(label) ? cloneVNode(label, { key: index }) : label;

          if (index === 0) {
            return [keyedLabel];
          }
          return [...list, SPLIT, keyedLabel];
        }, []);
      });

    return rawValues.value.map((valueCells) => {
      const valueOptions = toPathOptions(valueCells, options.value, fieldNames.value);

      const label = mergedDisplayRender(
        valueOptions.map(({ option, value }) => option?.[fieldNames.value.label] ?? value),
        valueOptions.map(({ option }) => option),
      );

      const value = toPathKey(valueCells);

      return {
        label,
        value,
        key: value,
        valueCells,
        disabled: valueOptions[valueOptions.length - 1]?.option?.disabled,
      };
    });
  });
};
