import type { CSSProperties } from 'vue';

export interface SplitterProps {
  style?: CSSProperties;
  rootClassName?: string;
  layout?: 'horizontal' | 'vertical';
  onResizeStart?: (sizes: (number | string)[]) => void;
  onResize?: (sizes: (number | string)[]) => void;
  onResizeEnd?: (sizes: (number | string)[]) => void;
  lazy?: boolean;
  barSize?: number | string;
}

export interface PanelProps {
  style?: CSSProperties;
  min?: number | string;
  max?: number | string;
  collapsible?: boolean | { start?: boolean; end?: boolean };
  resizable?: boolean;
  defaultSize?: number | string;
}

export interface InternalPanelProps extends PanelProps {
  size?: number | string;
}
