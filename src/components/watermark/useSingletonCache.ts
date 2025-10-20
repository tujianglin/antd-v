import { isEqual } from 'lodash-es';
import { shallowRef } from 'vue';

export type GetCache<T, R> = (cacheKeys: T, callback: () => R) => R;

/**
 * Singleton cache will only take latest `cacheParams` as key
 * and return the result for callback matching.
 */
export default function useSingletonCache<T extends any[], R>(): GetCache<T, R> {
  const cacheRef = shallowRef<[any[] | null, R | null]>([null, null]);

  const getCache: GetCache<T, R> = (cacheKeys, callback) => {
    const filteredKeys = cacheKeys.map((item) => (item instanceof HTMLElement || Number.isNaN(item) ? '' : item));

    if (!isEqual(cacheRef.value[0], filteredKeys)) {
      cacheRef.value = [filteredKeys, callback()];
    }
    return cacheRef.value[1]!;
  };

  return getCache;
}
