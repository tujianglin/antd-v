import type { CSSProperties } from 'vue';
import type { ShowCollapsibleIconMode } from './SplitBar.vue';

// ================ outside ================
export interface SplitterProps {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  rootClassName?: string;
  orientation?: 'horizontal' | 'vertical';
  onResizeStart?: (sizes: number[]) => void;
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  lazy?: boolean;
}

export interface PanelProps {
  class?: string;
  style?: CSSProperties;
  min?: number | string;
  max?: number | string;
  size?: number | string;
  collapsible?: boolean | { start?: boolean; end?: boolean; showCollapsibleIcon?: ShowCollapsibleIconMode };
  resizable?: boolean;
  defaultSize?: number | string;
}

// ================ inside ================

export interface InternalPanelProps extends PanelProps {
  class?: string;
  prefixCls?: string;
}

export interface UseResizeProps extends Pick<SplitterProps, 'onResize'> {
  basicsState: number[];
  items: PanelProps[];
  panelsRef: any;
  reverse: boolean;
  setBasicsState: any;
}

export interface UseResize {
  setSize: (data: { size: number; index: number }[]) => void;
  setOffset: (offset: number, containerSize: number, index: number) => void;
}

export interface UseHandleProps extends Pick<SplitterProps, 'orientation' | 'onResizeStart' | 'onResizeEnd'> {
  basicsState: number[];
  containerRef?: any;
  setOffset: UseResize['setOffset'];
  setResizing: any;
}

export interface UseHandle {
  onStart: (x: number, y: number, index: number) => void;
}

export interface UseCollapsibleProps {
  basicsState: number[];
  collapsible?: PanelProps['collapsible'];
  index: number;
  reverse: boolean;
  setSize?: UseResize['setSize'];
}

export interface UseCollapsible {
  nextIcon: boolean;
  overlap: boolean;
  previousIcon: boolean;
  onFold: (type: 'previous' | 'next') => void;
  setOldBasics: () => void;
}
