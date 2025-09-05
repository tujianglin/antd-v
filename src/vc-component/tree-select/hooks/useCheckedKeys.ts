import type { DataEntity } from '@/vc-component/tree/interface';
import { conductCheck } from '@/vc-component/tree/utils/conductUtil';
import type { VueKey } from '@/vc-util/type';
import { reactiveComputed } from '@vueuse/core';
import { type Ref } from 'vue';
import type { LabeledValueType } from '../interface';

const useCheckedKeys = (
  rawLabeledValues: Ref<LabeledValueType[]>,
  rawHalfCheckedValues: Ref<LabeledValueType[]>,
  treeConduction: Ref<boolean>,
  keyEntities: Ref<Record<VueKey, DataEntity>>,
) => {
  return reactiveComputed(() => {
    const extractValues = (values: LabeledValueType[]): VueKey[] => values.map(({ value }) => value);

    const checkedKeys = extractValues(rawLabeledValues.value);
    const halfCheckedKeys = extractValues(rawHalfCheckedValues.value);

    const missingValues = checkedKeys.filter((key) => !keyEntities.value[key as VueKey]);

    let finalCheckedKeys = checkedKeys;
    let finalHalfCheckedKeys = halfCheckedKeys;

    if (treeConduction.value) {
      const conductResult = conductCheck(checkedKeys, true, keyEntities.value);
      finalCheckedKeys = conductResult.checkedKeys;
      finalHalfCheckedKeys = conductResult.halfCheckedKeys;
    }

    return {
      rawCheckedValues: Array.from(new Set([...missingValues, ...finalCheckedKeys])),
      rawHalfCheckedValues: finalHalfCheckedKeys,
    };
  });
};

export default useCheckedKeys;
