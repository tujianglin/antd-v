import canUseDom from '@/vc-util/Dom/canUseDom';
import { computed, type ComputedRef } from 'vue';
import type { TableSticky } from '../interface';

// fix ssr render
const defaultContainer = canUseDom() ? window : null;

/** Sticky header hooks */
export default function useSticky(
  sticky: ComputedRef<boolean | TableSticky>,
  prefixCls: ComputedRef<string>,
): {
  isSticky: ComputedRef<boolean>;
  offsetHeader: ComputedRef<number>;
  offsetSummary: ComputedRef<number>;
  offsetScroll: ComputedRef<number>;
  stickyClassName: ComputedRef<string>;
  container: ComputedRef<Window | HTMLElement>;
} {
  const offsetHeader = computed(() => (typeof sticky.value === 'object' ? sticky.value?.offsetHeader : 0));
  const offsetSummary = computed(() => (typeof sticky.value === 'object' ? sticky.value?.offsetSummary : 0));
  const offsetScroll = computed(() => (typeof sticky.value === 'object' ? sticky.value?.offsetScroll : 0));
  const getContainer = computed(() => (typeof sticky.value === 'object' ? sticky.value?.getContainer : () => defaultContainer));

  const container = computed(() => getContainer.value() || defaultContainer);

  const isSticky = computed(() => !!sticky.value);

  return {
    isSticky,
    stickyClassName: computed(() => (isSticky.value ? `${prefixCls.value}-sticky-holder` : '')),
    offsetHeader,
    offsetSummary,
    offsetScroll,
    container,
  };
}
