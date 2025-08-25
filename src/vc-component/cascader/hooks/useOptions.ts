import { computed, type Ref } from 'vue';
import type { DefaultOptionType } from '..';
import type { InternalFieldNames, LegacyKey, SingleValueType } from '../Cascader.vue';
import useEntities, { type GetEntities } from './useEntities';

export default function useOptions(
  mergedFieldNames: Ref<InternalFieldNames>,
  options?: Ref<DefaultOptionType[]>,
): [
  mergedOptions: Ref<DefaultOptionType[]>,
  getPathKeyEntities: Ref<GetEntities>,
  getValueByKeyPath: (pathKeys: LegacyKey[]) => SingleValueType[],
] {
  const mergedOptions = computed(() => options.value || []);

  // Only used in multiple mode, this fn will not call in single mode
  const getPathKeyEntities = computed(() => useEntities(mergedOptions.value, mergedFieldNames.value));

  /** Convert path key back to value format */
  const getValueByKeyPath = (pathKeys: LegacyKey[]): SingleValueType[] => {
    const keyPathEntities = getPathKeyEntities.value();

    return pathKeys.map((pathKey) => {
      const { nodes } = keyPathEntities[pathKey];

      return nodes.map((node) => (node as Record<string, any>)[mergedFieldNames.value.value]);
    });
  };

  return [mergedOptions, getPathKeyEntities, getValueByKeyPath];
}
