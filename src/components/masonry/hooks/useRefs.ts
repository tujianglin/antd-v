import type { VueKey } from '@/vc-util/type';
import { shallowRef } from 'vue';

export default function useRefs() {
  const refs = shallowRef<Map<VueKey, HTMLDivElement | null> | null>(null);

  if (refs.value === null) {
    refs.value = new Map();
  }

  const setRef = (key: VueKey, element: HTMLDivElement | null) => {
    refs.value!.set(key, element);
  };

  const getRef = (key: VueKey) => refs.value!.get(key);

  return [setRef, getRef] as const;
}
