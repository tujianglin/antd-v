import { effectScope, getCurrentInstance, onUnmounted } from 'vue';
import { pathKey, type KeyType } from '../Cache';
import { useStyleContext } from '../StyleContext';
import useHMR from './useHMR';

export type ExtractStyle<CacheValue> = (
  cache: CacheValue,
  effectStyles: Record<string, boolean>,
  options?: {
    plain?: boolean;
    autoPrefix?: boolean;
  },
) => [order: number, styleId: string, style: string] | null;

const effectMap = new Map<string, boolean>();

// 追踪每个组件实例注册的样式路径，用于清理
interface StyleTrackInfo {
  scope: ReturnType<typeof effectScope>;
  pathStr: string;
}
const instanceStylesMap = new WeakMap<object, Map<string, StyleTrackInfo>>();
const instanceCleanupRegistered = new WeakSet<object>();

export default function useGlobalCache<CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
  onCacheEffect?: (cachedValue: CacheType) => void,
): CacheType {
  const styleContext = useStyleContext();
  const fullPath = [prefix, ...keyPath];
  const fullPathStr = pathKey(fullPath);

  const HMRUpdate = useHMR();
  const instance = getCurrentInstance();

  // 使用 prefix + 基础路径作为追踪 key（不包含 token 相关的动态部分）
  const trackKey = `${prefix}:${keyPath[0] || ''}`;

  type UpdaterArgs = [times: number, cache: CacheType];

  // 获取或创建组件实例的样式追踪 map
  let instanceStyles: Map<string, StyleTrackInfo> | undefined;
  if (instance) {
    instanceStyles = instanceStylesMap.get(instance);
    if (!instanceStyles) {
      instanceStyles = new Map();
      instanceStylesMap.set(instance, instanceStyles);
    }

    // 只在首次时注册 onUnmounted（确保在 setup 阶段）
    if (!instanceCleanupRegistered.has(instance)) {
      instanceCleanupRegistered.add(instance);
      onUnmounted(() => {
        const styles = instanceStylesMap.get(instance);
        if (styles) {
          styles.forEach(({ scope, pathStr }) => {
            scope.stop();
            const globalCache = styleContext.value.cache;
            globalCache.opUpdate(pathStr, (prevCache) => {
              if (!prevCache) return null;
              const [times = 0, cache] = prevCache;
              const nextCount = times - 1;
              if (nextCount <= 0) {
                onCacheRemove?.(cache, false);
                effectMap.delete(pathStr);
                return null;
              }
              return [nextCount, cache];
            });
          });
          instanceStylesMap.delete(instance);
        }
        instanceCleanupRegistered.delete(instance);
      });
    }

    // 检查是否有旧的样式需要清理（token 变化导致 pathStr 变化）
    const existing = instanceStyles.get(trackKey);
    if (existing && existing.pathStr !== fullPathStr) {
      // 清理旧样式
      existing.scope.stop();
      const globalCache = styleContext.value.cache;
      globalCache.opUpdate(existing.pathStr, (prevCache) => {
        if (!prevCache) return null;
        const [times = 0, cache] = prevCache;
        const nextCount = times - 1;
        if (nextCount <= 0) {
          onCacheRemove?.(cache, false);
          effectMap.delete(existing.pathStr);
          return null;
        }
        return [nextCount, cache];
      });
      instanceStyles.delete(trackKey);
    }
  }

  const buildCache = (updater?: (data: UpdaterArgs) => UpdaterArgs) => {
    const globalCache = styleContext.value.cache;
    globalCache.opUpdate(fullPathStr, (prevCache) => {
      const [times = 0, cache] = prevCache || [undefined, undefined];

      // HMR should always ignore cache since developer may change it
      let tmpCache = cache;
      if (process.env.NODE_ENV !== 'production' && cache && HMRUpdate) {
        onCacheRemove?.(tmpCache, HMRUpdate);
        tmpCache = null;
      }

      const mergedCache = tmpCache || cacheFn();
      const data: UpdaterArgs = [times, mergedCache];

      return updater ? updater(data) : data;
    });
  };

  // Create cache
  buildCache();
  const cacheEntity = styleContext.value.cache.opGet(fullPathStr);
  const cacheValue = cacheEntity![1];

  // 创建新的 scope 并追踪
  const scope = effectScope();
  if (instance && instanceStyles && !instanceStyles.has(trackKey)) {
    instanceStyles.set(trackKey, { scope, pathStr: fullPathStr });
  }

  // 增加引用计数
  buildCache(([times, cache]) => [times + 1, cache]);

  // 触发 effect
  if (!effectMap.has(fullPathStr)) {
    onCacheEffect?.(cacheValue);
    effectMap.set(fullPathStr, true);

    Promise.resolve().then(() => {
      effectMap.delete(fullPathStr);
    });
  }

  return cacheValue;
}
