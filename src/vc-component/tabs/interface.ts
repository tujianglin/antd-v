import type { DropdownProps } from '@/vc-component/dropdown';
import type { CSSMotionProps } from '@/vc-component/motion';
import type { CSSProperties } from 'vue';
import type { TabPaneProps } from './TabPanelList/TabPane.vue';

export type TriggerProps = {
  trigger?: 'hover' | 'click';
};
export type moreIcon = any;
export type MoreProps = {
  icon?: moreIcon;
} & Omit<DropdownProps, 'children'>;

export type SizeInfo = [width: number, height: number];

export type TabSizeMap = Map<PropertyKey, { width: number; height: number; left: number; top: number }>;

export interface TabOffset {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
}

export type TabOffsetMap = Map<PropertyKey, TabOffset>;

export type TabPosition = 'left' | 'right' | 'top' | 'bottom';

export interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string;
  label: any;
}

type RenderTabBarProps = {
  id: string;
  activeKey: string;
  animated: AnimatedConfig;
  tabPosition: TabPosition;
  rtl: boolean;
  mobile: boolean;
  editable: EditableConfig;
  locale: TabsLocale;
  more: MoreProps;
  tabBarGutter: number;
  onTabClick: (key: string, e: MouseEvent | KeyboardEvent) => void;
  onTabScroll: OnTabScroll;
  extra: TabBarExtraContent;
  style: CSSProperties;
};

export type RenderTabBar = (props: RenderTabBarProps, DefaultTabBar: any) => any;

export interface TabsLocale {
  dropdownAriaLabel?: string;
  removeAriaLabel?: string;
  addAriaLabel?: string;
}

export interface EditableConfig {
  onEdit: (type: 'add' | 'remove', info: { key?: string; event: MouseEvent | KeyboardEvent }) => void;
  showAdd?: boolean;
  removeIcon?: any;
  addIcon?: any;
}

export interface AnimatedConfig {
  inkBar?: boolean;
  tabPane?: boolean;
  tabPaneMotion?: CSSMotionProps;
}

export type OnTabScroll = (info: { direction: 'left' | 'right' | 'top' | 'bottom' }) => void;

export type TabBarExtraPosition = 'left' | 'right';

export type TabBarExtraMap = Partial<Record<TabBarExtraPosition, any>>;

export type TabBarExtraContent = any | TabBarExtraMap;
