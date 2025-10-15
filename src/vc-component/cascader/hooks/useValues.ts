import type { DataEntity } from '@/vc-component/tree/interface';
import { conductCheck } from '@/vc-component/tree/utils/conductUtil';
import { reactiveComputed } from '@vueuse/core';
import { type Ref } from 'vue';
import type { LegacyKey, SingleValueType } from '../Cascader.vue';
import { toPathKeys } from '../utils/commonUtil';
import type { GetMissValues } from './useMissingValues';

export default function useValues(
  multiple: Ref<boolean>,
  rawValues: Ref<SingleValueType[]>,
  getPathKeyEntities: () => Record<string, DataEntity>,
  getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[],
  getMissingValues: Ref<GetMissValues>,
): { checkedValues: SingleValueType[]; halfCheckedValues: SingleValueType[]; missingCheckedValues: SingleValueType[] } {
  // Fill `rawValues` with checked conduction values
  return reactiveComputed(() => {
    const [existValues, missingValues] = getMissingValues.value(rawValues.value);
    if (!multiple.value || !rawValues.value.length) {
      return {
        checkedValues: existValues,
        halfCheckedValues: [],
        missingCheckedValues: missingValues,
      };
    }

    const keyPathValues = toPathKeys(existValues);
    const keyPathEntities = getPathKeyEntities();

    const { checkedKeys, halfCheckedKeys } = conductCheck(keyPathValues, true, keyPathEntities) as {
      checkedKeys: LegacyKey[];
      halfCheckedKeys: LegacyKey[];
    };

    // Convert key back to value cells
    return {
      checkedValues: getValueByKeyPath(checkedKeys),
      halfCheckedValues: getValueByKeyPath(halfCheckedKeys),
      missingCheckedValues: missingValues,
    };
  });
}
