import { toArray } from '@/vc-util/Children/toArray';
import type { VueNode } from '@/vc-util/type';
import { computed, type Ref } from 'vue';
import Sider from '../Sider.vue';

export default function useHasSider(siders: Ref<string[]>, children?: Ref<VueNode>, hasSider?: boolean) {
  return computed(() => {
    if (siders.value.length) {
      return true;
    }
    if (hasSider) {
      const childNodes = toArray(children?.value);
      return childNodes?.some((node) => node.type === Sider);
    } else {
      return false;
    }
  });
}
