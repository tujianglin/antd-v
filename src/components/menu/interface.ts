import type {
  MenuDividerType as RcMenuDividerType,
  MenuItemGroupType as RcMenuItemGroupType,
  MenuItemType as RcMenuItemType,
  SubMenuType as RcSubMenuType,
} from '@/vc-component/menu/interface';
import type { VueKey, VueNode } from '@/vc-util/type';

export type DataAttributes = {
  [Key in `data-${string}`]: unknown;
};

export interface MenuItemType extends RcMenuItemType, DataAttributes {
  danger?: boolean;
  icon?: VueNode;
  title?: string;
}

export interface SubMenuType<T extends MenuItemType = MenuItemType> extends Omit<RcSubMenuType, 'children'> {
  icon?: VueNode;
  theme?: 'dark' | 'light';
  children: ItemType<T>[];
}

export interface MenuItemGroupType<T extends MenuItemType = MenuItemType> extends Omit<RcMenuItemGroupType, 'children'> {
  children?: ItemType<T>[];
  key?: VueKey;
}

export interface MenuDividerType extends RcMenuDividerType {
  dashed?: boolean;
  key?: VueKey;
}

export type ItemType<T extends MenuItemType = MenuItemType> = T | SubMenuType<T> | MenuItemGroupType<T> | MenuDividerType | null;
