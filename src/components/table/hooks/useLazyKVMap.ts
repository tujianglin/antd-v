import { ref, type Ref } from 'vue';
import type { AnyObject } from '../../_util/type';
import type { GetRowKey, Key } from '../interface';

interface MapCache<RecordType = AnyObject> {
  data?: RecordType[];
  childrenColumnName?: string;
  kvMap?: Map<Key, RecordType>;
  getRowKey?: (record: RecordType, index: number) => Key;
}

const useLazyKVMap = <RecordType extends AnyObject = AnyObject>(
  data: Ref<RecordType[]>,
  childrenColumnName: Ref<string>,
  getRowKey: Ref<GetRowKey<RecordType>>,
) => {
  const mapCacheRef = ref<MapCache<RecordType>>({});

  function getRecordByKey(key: Key): RecordType {
    if (
      !mapCacheRef.value ||
      mapCacheRef.value.data !== data.value ||
      mapCacheRef.value.childrenColumnName !== childrenColumnName.value ||
      mapCacheRef.value.getRowKey !== getRowKey.value
    ) {
      const kvMap = new Map<Key, RecordType>();

      function dig(records: readonly RecordType[]) {
        records.forEach((record, index) => {
          const rowKey = getRowKey.value(record, index);
          kvMap.set(rowKey, record);

          if (record && typeof record === 'object' && childrenColumnName.value in record) {
            dig(record[childrenColumnName.value] || []);
          }
        });
      }

      dig(data.value);

      mapCacheRef.value = {
        data: data.value,
        childrenColumnName: childrenColumnName.value,
        kvMap,
        getRowKey: getRowKey.value,
      };
    }

    return mapCacheRef.value.kvMap?.get(key) as RecordType;
  }

  return [getRecordByKey] as const;
};

export default useLazyKVMap;
