import useControlledState from '@/vc-util/hooks/useControlledState';
import type { VueKey } from '@/vc-util/type';
import { computed, watch, type ComputedRef, type Ref } from 'vue';
import type { TransferKey } from '../interface';

const EMPTY_KEYS: TransferKey[] = [];

function filterKeys(keys: TransferKey[], dataKeys: Set<TransferKey>) {
  const filteredKeys = keys.filter((key) => dataKeys.has(key));
  return keys.length === filteredKeys.length ? keys : filteredKeys;
}

function useSelection<T extends { key: TransferKey }>(
  leftDataSource: Ref<T[]>,
  rightDataSource: Ref<T[]>,
  selectedKeys?: Ref<TransferKey[]>,
): [
  sourceSelectedKeys: ComputedRef<TransferKey[]>,
  targetSelectedKeys: ComputedRef<TransferKey[]>,
  setSourceSelectedKeys: (srcKeys: TransferKey[]) => void,
  setTargetSelectedKeys: (srcKeys: TransferKey[]) => void,
] {
  // Prepare `dataSource` keys
  const leftKeys = computed(() => new Set(leftDataSource.value.map<VueKey>((src) => src?.key)));
  const rightKeys = computed(() => new Set(rightDataSource.value.map<VueKey>((src) => src?.key)));

  // Selected Keys
  const [mergedSelectedKeys, setMergedSelectedKeys] = useControlledState<VueKey[]>(EMPTY_KEYS, selectedKeys);

  const sourceSelectedKeys = computed(() => filterKeys(mergedSelectedKeys.value, leftKeys.value));
  const targetSelectedKeys = computed(() => filterKeys(mergedSelectedKeys.value, rightKeys.value));

  // // Reset when data changed;
  watch(
    [leftKeys, rightKeys],
    () => {
      setMergedSelectedKeys([
        ...filterKeys(mergedSelectedKeys.value, leftKeys.value),
        ...filterKeys(mergedSelectedKeys.value, rightKeys.value),
      ]);
    },
    { deep: true },
  );

  // Update keys
  const setSourceSelectedKeys = (nextSrcKeys: TransferKey[]) => {
    setMergedSelectedKeys([...nextSrcKeys, ...targetSelectedKeys.value]);
  };
  const setTargetSelectedKeys = (nextTargetKeys: TransferKey[]) => {
    setMergedSelectedKeys([...sourceSelectedKeys.value, ...nextTargetKeys]);
  };

  return [
    // Keys
    sourceSelectedKeys,
    targetSelectedKeys,
    // Updater
    setSourceSelectedKeys,
    setTargetSelectedKeys,
  ];
}

export default useSelection;
