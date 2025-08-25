import type { ImageElementProps } from './interface';

export const COMMON_PROPS: (keyof Omit<ImageElementProps, 'src'>)[] = [
  'crossorigin',
  'decoding',
  'draggable',
  'loading',
  'referrerpolicy',
  'sizes',
  'srcset',
  'usemap',
  'alt',
];
