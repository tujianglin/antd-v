import type { VueKey, VueNode } from '@/vc-util/type';
import type { CSSProperties, HTMLAttributes } from 'vue';
import type { InnerProps } from './Filler.vue';
import type { ScrollBarDirectionType } from './ScrollBar.vue';
import type { ScrollPos, ScrollTarget } from './hooks/useScrollTo';

export type RenderFunc<T> = (data: { item: T; index: number; props: { style: CSSProperties; offsetX: number } }) => VueNode;

export interface SharedConfig<T> {
  getKey: (item: T) => VueKey;
}

export type GetKey<T> = (item: T) => VueKey;

export type GetSize = (startKey: VueKey, endKey?: VueKey) => { top: number; bottom: number };

export interface ExtraRenderInfo {
  /** Virtual list start line */
  start: number;
  /** Virtual list end line */
  end: number;
  /** Is current in virtual render */
  virtual: boolean;
  /** Used for `scrollWidth` tell the horizontal offset */
  offsetX: number;
  offsetY: number;

  rtl: boolean;

  getSize: GetSize;
}

export interface ScrollInfo {
  x: number;
  y: number;
}

export type ScrollConfig = ScrollTarget | ScrollPos;

export type ScrollTo = (arg?: number | ScrollConfig | null) => void;

export type ListRef = {
  nativeElement: HTMLDivElement;
  scrollTo: ScrollTo;
  getScrollInfo: () => ScrollInfo;
};

export interface ListProps<T> extends /** @vue-ignore */ Omit<HTMLAttributes, 'onScroll'> {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  data: T[];
  height?: number;
  itemHeight?: number;
  /** If not match virtual scroll condition, Set List still use height of container. */
  fullHeight?: boolean;
  itemKey: VueKey | ((item: T) => VueKey);
  component?: string;
  /** Set `false` will always use real scroll instead of virtual one */
  virtual?: boolean;
  direction?: ScrollBarDirectionType;
  /**
   * By default `scrollWidth` is same as container.
   * When set this, it will show the horizontal scrollbar and
   * `scrollWidth` will be used as the real width instead of container width.
   * When set, `virtual` will always be enabled.
   */
  scrollWidth?: number;

  styles?: {
    horizontalScrollBar?: CSSProperties;
    horizontalScrollBarThumb?: CSSProperties;
    verticalScrollBar?: CSSProperties;
    verticalScrollBarThumb?: CSSProperties;
  };
  showScrollBar?: boolean | 'optional';
  onScroll?: (e: UIEvent) => void;

  /**
   * Given the virtual offset value.
   * It's the logic offset from start position.
   */
  onVirtualScroll?: (info: ScrollInfo) => void;

  /** Trigger when render list item changed */
  onVisibleChange?: (visibleList: T[], fullList: T[]) => void;

  /** Inject to inner container props. Only use when you need pass aria related data */
  innerProps?: InnerProps;

  /** Render extra content into Filler */
  extraRender?: (info: ExtraRenderInfo) => VueNode;
}
