import { computed, ref, type Ref } from 'vue';
import type { LabeledValueType, VueKey } from '../interface';

/**
 * This function will try to call requestIdleCallback if available to save performance.
 * No need `getLabel` here since already fetch on `rawLabeledValue`.
 */
export default (values: Ref<LabeledValueType[]>): Ref<LabeledValueType[]> => {
  const cacheRef = ref({
    valueLabels: new Map<VueKey, any>(),
  });

  return computed(() => {
    const { valueLabels } = cacheRef.value;
    const valueLabelsCache = new Map<VueKey, any>();

    const filledValues = values.value.map((item) => {
      const { value, label } = item;
      const mergedLabel = label ?? valueLabels.get(value);

      // Save in cache
      valueLabelsCache.set(value, mergedLabel);

      return {
        ...item,
        label: mergedLabel,
      };
    });

    cacheRef.value.valueLabels = valueLabelsCache;

    return filledValues;
  });
};
