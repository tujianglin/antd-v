export const ProgressTypes = ['line', 'circle', 'dashboard'] as const;
export type ProgressType = (typeof ProgressTypes)[number];

export const ProgressStatuses = ['normal', 'exception', 'active', 'success'] as const;
