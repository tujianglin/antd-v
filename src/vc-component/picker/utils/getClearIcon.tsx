export function getClearIcon(prefixCls: string, allowClear?: boolean | { clearIcon?: any }, clearIcon?: any) {
  const mergedClearIcon = typeof allowClear === 'object' ? allowClear.clearIcon : clearIcon;

  return mergedClearIcon || <span class={`${prefixCls}-clear-btn`} />;
}
