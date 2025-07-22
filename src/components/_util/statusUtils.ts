import clsx from 'clsx';

const _InputStatuses = ['warning', 'error', ''] as const;
export type InputStatus = (typeof _InputStatuses)[number];

const _ValidateStatuses = ['success', 'warning', 'error', 'validating', ''] as const;
export type ValidateStatus = (typeof _ValidateStatuses)[number];
export function getStatusClassNames(prefixCls: string, status?: ValidateStatus, hasFeedback?: boolean) {
  return clsx({
    [`${prefixCls}-status-success`]: status === 'success',
    [`${prefixCls}-status-warning`]: status === 'warning',
    [`${prefixCls}-status-error`]: status === 'error',
    [`${prefixCls}-status-validating`]: status === 'validating',
    [`${prefixCls}-has-feedback`]: hasFeedback,
  });
}

export const getMergedStatus = (contextStatus?: ValidateStatus, customStatus?: InputStatus) => customStatus || contextStatus;
