import type { VueKey, VueNode } from '@/vc-util/type';
import type { CSSProperties, HTMLAttributes } from 'vue';

export const RESPONSIVE = 'responsive' as const;
export const INVALIDATE = 'invalidate' as const;

export interface OverflowProps<ItemType> extends /** @vue-ignore */ Omit<HTMLAttributes, 'prefix'> {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  data?: ItemType[];
  itemKey?: VueKey | ((item: ItemType) => VueKey);
  /** Used for `responsive`. It will limit render node to avoid perf issue */
  itemWidth?: number;
  renderItem?: (item: ItemType, info: { index: number }) => VueNode;
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawItem?: (item: ItemType, index: number) => VueNode;
  maxCount?: number | typeof RESPONSIVE | typeof INVALIDATE;
  renderRest?: VueNode | ((omittedItems: ItemType[]) => VueNode);
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawRest?: (omittedItems: ItemType[]) => VueNode;
  prefix?: VueNode;
  suffix?: VueNode;
  component?: any;
  itemComponent?: any;

  /** @private This API may be refactor since not well design */
  onVisibleChange?: (visibleCount: number) => void;

  /** When set to `full`, ssr will render full items by default and remove at client side */
  ssr?: 'full';
}
