import { onBeforeUnmount, shallowRef, watch, watchEffect, type Ref, type ShallowRef } from 'vue';
import { pathKey, type KeyType } from '../Cache';
import { useStyleInject } from '../StyleContext';
import useHMR from './useHMR';

export type ExtractStyle<CacheValue> = (
  cache: CacheValue,
  effectStyles: Record<string, boolean>,
  options?: {
    plain?: boolean;
  },
) => [order: number, styleId: string, style: string] | null;

export default function useGlobalCache<CacheType>(
  prefix: string,
  keyPath: Ref<KeyType[]>,
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
  // Add additional effect trigger by `useInsertionEffect`
  onCacheEffect?: (cachedValue: CacheType) => void,
): ShallowRef<CacheType> {
  const styleContext = useStyleInject();
  const fullPathStr = shallowRef('');
  const cacheEntity = shallowRef('');
  const cacheContent = shallowRef<CacheType | null>(null);
  watchEffect(() => {
    fullPathStr.value = pathKey([prefix, ...keyPath.value]);
  });

  const HMRUpdate = useHMR();

  const buildCache = () => {
    styleContext.value.cache.opUpdate(fullPathStr.value, (prevCache) => {
      const [times = 0, cache] = prevCache || [undefined, undefined];

      // HMR should always ignore cache since developer may change it
      let tmpCache = cache;
      if (process.env.NODE_ENV !== 'production' && cache && HMRUpdate) {
        onCacheRemove?.(tmpCache, HMRUpdate);
        tmpCache = null;
      }

      const mergedCache = tmpCache || cacheFn();
      // Call updater if need additional logic
      return [times + 1, mergedCache];
    });
  };

  const clearCache = (pathStr: string) => {
    styleContext.value.cache.opUpdate(pathStr, (prevCache) => {
      const [times = 0, cache] = prevCache || [];
      const nextCount = times - 1;
      if (nextCount === 0) {
        onCacheRemove?.(cache, false);
        return null;
      }

      return [times - 1, cache];
    });
  };

  watch(
    fullPathStr,
    (newStr, oldStr) => {
      if (oldStr) clearCache(oldStr);
      buildCache();

      cacheEntity.value = styleContext.value.cache.opGet(newStr) as any;
      cacheContent.value = cacheEntity.value![1];
      onCacheEffect(cacheContent.value);
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    clearCache(fullPathStr.value);
  });
  return cacheContent;
}
