import { ItemGroup, type MenuRef as RcMenuRef } from '@/vc-component/menu';
import type { MenuProps } from './InternalMenu.vue';
import InternalMenu from './menu.vue';
import type { MenuTheme } from './MenuContext';
import MenuDivider from './MenuDivider.vue';
import type { MenuItemProps } from './MenuItem.vue';
import Item from './MenuItem.vue';
import type { SubMenuProps } from './SubMenu.vue';
import SubMenu from './SubMenu.vue';
export type { MenuItemGroupProps } from '@/vc-component/menu';
export type { MenuDividerProps } from './MenuDivider.vue';

export type { MenuItemProps, MenuProps, MenuTheme, SubMenuProps };

type CompoundedComponent = typeof InternalMenu & {
  Item: typeof Item;
  SubMenu: typeof SubMenu;
  Divider: typeof MenuDivider;
  ItemGroup: typeof ItemGroup;
};

const Menu = InternalMenu as CompoundedComponent;
Menu.Item = Item;
Menu.SubMenu = SubMenu;
Menu.Divider = MenuDivider;
Menu.ItemGroup = ItemGroup;

export type MenuRef = {
  menu: RcMenuRef | null;
  focus: (options?: FocusOptions) => void;
};

export default Menu;
