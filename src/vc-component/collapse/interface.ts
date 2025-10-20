import type { CSSMotionProps } from '@/vc-component/motion';
import type { VueKey, VueNode } from '@/vc-util/type';
import type { CSSProperties, HTMLAttributes } from 'vue';

export type CollapsibleType = 'header' | 'icon' | 'disabled';

export interface ItemType
  extends Omit<
    CollapsePanelProps,
    | 'header' // alias of label
    | 'prefixCls'
    | 'panelKey' // alias of key
    | 'isActive'
    | 'accordion'
    | 'openMotion'
    | 'expandIcon'
  > {
  key?: CollapsePanelProps['panelKey'];
  label?: CollapsePanelProps['header'];
}

export interface CollapseProps {
  prefixCls?: string;
  openMotion?: CSSMotionProps;
  onChange?: (key: VueKey[]) => void;
  accordion?: boolean;
  class?: string;
  style?: object;
  destroyOnHidden?: boolean;
  expandIcon?: (props: any) => any;
  collapsible?: CollapsibleType;
  /**
   * Collapse items content
   * @since 3.6.0
   */
  items?: ItemType[];
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export type SemanticName = 'header' | 'title' | 'body' | 'icon';

export interface CollapsePanelProps extends /** @vue-ignore */ Omit<HTMLAttributes, 'style'> {
  id?: string;
  header?: VueNode;
  prefixCls?: string;
  headerClass?: string;
  showArrow?: boolean;
  class?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  style?: CSSProperties;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  isActive?: boolean;
  openMotion?: CSSMotionProps;
  destroyOnHidden?: boolean;
  accordion?: boolean;
  forceRender?: boolean;
  extra?: VueNode;
  onItemClick?: (panelKey: VueKey) => void;
  expandIcon?: (props: object) => VueNode;
  panelKey?: VueKey;
  role?: string;
  collapsible?: CollapsibleType;
  children?: any;
}
