import { groupKeysMap } from '@/components/_util/transKeys';
import { computed, type Ref } from 'vue';
import type { AnyObject } from '../../_util/type';
import type { KeyWise, TransferProps } from '../index.vue';
import type { TransferKey } from '../interface';

const useData = <RecordType extends AnyObject>(
  dataSource?: Ref<RecordType[]>,
  rowKey?: Ref<TransferProps<RecordType>['rowKey']>,
  targetKeys?: Ref<TransferKey[]>,
) => {
  const mergedDataSource = computed(() =>
    (dataSource?.value || []).map((record) => {
      if (rowKey?.value) {
        return { ...record, key: rowKey?.value?.(record) };
      }
      return record;
    }),
  );

  const allDataSource = computed(() => {
    const leftData: KeyWise<RecordType>[] = [];
    const rightData = Array.from<KeyWise<RecordType>>({ length: targetKeys?.value?.length ?? 0 });
    const targetKeysMap = groupKeysMap(targetKeys?.value || []);
    mergedDataSource.value.forEach((record) => {
      // rightData should be ordered by targetKeys
      // leftData should be ordered by dataSource
      if (targetKeysMap.has(record.key)) {
        const idx = targetKeysMap.get(record.key)!;
        rightData[idx] = record as KeyWise<RecordType>;
      } else {
        leftData.push(record as KeyWise<RecordType>);
      }
    });
    return [leftData, rightData] as const;
  });

  return [
    mergedDataSource,
    computed(() => allDataSource.value[0].filter(Boolean)),
    computed(() => allDataSource.value[1].filter(Boolean)),
  ];
};

export default useData;
