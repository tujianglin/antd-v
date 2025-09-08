import warning from '@/vc-util/warning';

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
export function fillClearIcon(prefixCls: string, allowClear?: boolean | { clearIcon?: any }, clearIcon?: any) {
  if (process.env.NODE_ENV !== 'production' && clearIcon) {
    warning(false, '`clearIcon` will be removed in future. Please use `allowClear` instead.');
  }

  if (!allowClear) {
    return null;
  }

  const config = allowClear && typeof allowClear === 'object' ? allowClear : {};

  return config.clearIcon || clearIcon || <span class={`${prefixCls}-clear-btn`} />;
}
