import type { VueNode } from '@/vc-util/type';
import { computed, type Ref } from 'vue';

/**
 * Since Select, TreeSelect, Cascader is same Select like component.
 * We just use same hook to handle this logic.
 *
 * If `suffixIcon` is not equal to `null`, always show it.
 */
export default function useShowArrow(suffixIcon?: Ref<VueNode>, showArrow?: Ref<boolean>) {
  return computed(() => (showArrow?.value !== undefined ? showArrow?.value : suffixIcon.value !== null));
}
