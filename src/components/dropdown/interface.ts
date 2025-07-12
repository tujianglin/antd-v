import type { DropdownMenuItemProps as ReDropdownMenuItemProps } from 'reka-ui';
import type { Component, CSSProperties, VNode } from 'vue';

export interface MenuProps {
  items?: ItemType[];
}

export type DropdownMenuItemProps = ReDropdownMenuItemProps & {
  type?: 'item';
  key: PropertyKey;
  label?: VNode | Component | string | null;
  icon?: VNode | Component | string | null;
  extra?: VNode | Component | string | null;
  style?: CSSProperties;
};

export type DropdownSubMenuProps<T extends DropdownMenuItemProps = DropdownMenuItemProps> = ReDropdownMenuItemProps & {
  type?: 'submenu';
  key: PropertyKey;
  label?: VNode | Component | string | null;
  icon?: VNode | Component | string | null;
  children: ItemType<T>[];
  style?: CSSProperties;
};

export type DropdownItemGroupProps<T extends DropdownMenuItemProps = DropdownMenuItemProps> = ReDropdownMenuItemProps & {
  type?: 'group';
  key: PropertyKey;
  label?: VNode | Component | string | null;
  children?: ItemType<T>[];
  style?: CSSProperties;
};

export type DropdownDividerProps = {
  type?: 'divider';
  key: PropertyKey;
};

export type ItemType<T extends DropdownMenuItemProps = DropdownMenuItemProps> =
  | T
  | DropdownSubMenuProps<T>
  | DropdownItemGroupProps<T>
  | DropdownDividerProps
  | null;

export interface DropdownProps {
  menu?: MenuProps;
}
