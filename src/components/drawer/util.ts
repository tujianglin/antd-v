import type { PushState } from './index.vue';

export const _SizeTypes = ['default', 'large'] as const;
export type sizeType = (typeof _SizeTypes)[number];
export const defaultPushState: PushState = { distance: 180 };
export const DEFAULT_SIZE = 378;
