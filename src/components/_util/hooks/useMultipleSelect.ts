import { ref } from 'vue';

export type PrevSelectedIndex = null | number;

/**
 * @title multipleSelect hooks
 * @description multipleSelect by hold down shift key
 */
export default function useMultipleSelect<T, K>(getKey: (item: T) => K) {
  const prevSelectedIndex = ref<PrevSelectedIndex>(null);

  const multipleSelect = (currentSelectedIndex: number, data: T[], selectedKeys: Set<K>) => {
    const configPrevSelectedIndex = prevSelectedIndex.value ?? currentSelectedIndex;

    // add/delete the selected range
    const startIndex = Math.min(configPrevSelectedIndex || 0, currentSelectedIndex);
    const endIndex = Math.max(configPrevSelectedIndex || 0, currentSelectedIndex);
    const rangeKeys = data.slice(startIndex, endIndex + 1).map((item) => getKey(item));
    const shouldSelected = rangeKeys.some((rangeKey) => !selectedKeys.has(rangeKey));
    const changedKeys: K[] = [];

    rangeKeys.forEach((item) => {
      if (shouldSelected) {
        if (!selectedKeys.has(item)) {
          changedKeys.push(item);
        }
        selectedKeys.add(item);
      } else {
        selectedKeys.delete(item);
        changedKeys.push(item);
      }
    });

    prevSelectedIndex.value = shouldSelected ? endIndex : null;

    return changedKeys;
  };

  const updatePrevSelectedIndex = (val: PrevSelectedIndex) => {
    prevSelectedIndex.value = val;
  };

  return [multipleSelect, updatePrevSelectedIndex] as const;
}
