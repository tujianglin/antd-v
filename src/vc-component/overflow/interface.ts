import type { VueKey } from '@/vc-util/type';
import type { CSSProperties, HTMLAttributes } from 'vue';
import type { RenderNode } from '../../components/_util/type';

export const RESPONSIVE = 'responsive' as const;
export const INVALIDATE = 'invalidate' as const;

export interface OverflowProps<ItemType> extends /** @vue-ignore */ HTMLAttributes {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  data?: ItemType[];
  itemKey?: VueKey | ((item: ItemType) => VueKey);
  /** Used for `responsive`. It will limit render node to avoid perf issue */
  itemWidth?: number;
  renderItem?: (item: ItemType, info: { index: number }) => RenderNode;
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawItem?: (item: ItemType, index: number) => RenderNode;
  maxCount?: number | typeof RESPONSIVE | typeof INVALIDATE;
  renderRest?: RenderNode | ((omittedItems: ItemType[]) => RenderNode);
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawRest?: (omittedItems: ItemType[]) => RenderNode;
  suffix?: RenderNode;
  component?: any;
  itemComponent?: any;

  /** @private This API may be refactor since not well design */
  onVisibleChange?: (visibleCount: number) => void;

  /** When set to `full`, ssr will render full items by default and remove at client side */
  ssr?: 'full';
}
