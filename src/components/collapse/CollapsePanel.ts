import type { VueKey, VueNode } from '@/vc-util/type';
import type { CSSProperties } from 'vue';

export type CollapsibleType = 'header' | 'icon' | 'disabled';

export interface CollapsePanelProps {
  key: VueKey;
  header: VueNode;
  class?: string;
  style?: CSSProperties;
  showArrow?: boolean;
  prefixCls?: string;
  forceRender?: boolean;
  id?: string;
  extra?: VueNode;
  collapsible?: CollapsibleType;
  children?: VueNode;
}
