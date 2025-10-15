import type { VueNode } from '@/vc-util/type';

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
export function fillClearIcon(prefixCls: string, allowClear?: boolean | { clearIcon?: VueNode }) {
  if (!allowClear) {
    return null;
  }

  const config = allowClear && typeof allowClear === 'object' ? allowClear : {};

  return config.clearIcon || <span class={`${prefixCls}-clear-btn`} />;
}
