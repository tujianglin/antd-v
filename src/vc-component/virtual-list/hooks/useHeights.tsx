import { onBeforeUnmount, ref, shallowRef, type Ref } from 'vue';
import findDOMNode from '../../../vc-util/Dom/findDOMNode';
import type { GetKey } from '../interface';
import CacheMap from '../utils/CacheMap';

function parseNumber(value: string) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export default function useHeights<T>(
  getKey: GetKey<T>,
  onItemAdd?: (item: T) => void,
  onItemRemove?: (item: T) => void,
): [
  setInstanceRef: (item: T, instance: HTMLElement) => void,
  collectHeight: (sync?: boolean) => void,
  cacheMap: Ref<CacheMap>,
  updatedMark: Ref<number>,
] {
  const updatedMark = ref(0);
  const instanceRef = shallowRef(new Map<PropertyKey, HTMLElement>());
  const heightsRef = shallowRef(new CacheMap());

  let promiseIdRef = 0;

  function cancelRaf() {
    promiseIdRef += 1;
  }

  function collectHeight(sync = false) {
    cancelRaf();

    const doCollect = () => {
      let changed = false;
      instanceRef.value.forEach((element, key) => {
        const dom = findDOMNode(element);
        if (dom) {
          const { offsetHeight } = dom;
          const { marginTop, marginBottom } = getComputedStyle(dom);
          const marginTopNum = parseNumber(marginTop);
          const marginBottomNum = parseNumber(marginBottom);
          const totalHeight = offsetHeight + marginTopNum + marginBottomNum;
          if (heightsRef.value.get(key) !== totalHeight) {
            heightsRef.value.set(key, totalHeight);
            changed = true;
          }
        }
      });

      // Always trigger update mark to tell parent that should re-calculate heights when resized
      if (changed) {
        updatedMark.value = updatedMark.value + 1;
      }
    };

    if (sync) {
      doCollect();
    } else {
      promiseIdRef += 1;
      const id = promiseIdRef;
      Promise.resolve().then(() => {
        if (id === promiseIdRef) {
          doCollect();
        }
      });
    }
  }

  function setInstanceRef(item: T, instance: HTMLElement) {
    const key = getKey(item);
    const origin = instanceRef.value.get(key);

    if (instance) {
      instanceRef.value.set(key, instance);
      collectHeight();
    } else {
      instanceRef.value.delete(key);
    }

    // Instance changed
    if (!origin !== !instance) {
      if (instance) {
        onItemAdd?.(item);
      } else {
        onItemRemove?.(item);
      }
    }
  }

  onBeforeUnmount(() => {
    cancelRaf();
  });

  return [setInstanceRef, collectHeight, heightsRef, updatedMark];
}
