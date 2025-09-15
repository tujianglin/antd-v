import { type MenuRef as RcMenuRef } from '@/vc-component/menu';
import type { MenuProps } from './InternalMenu.vue';
import Menu from './menu.vue';
import type { MenuTheme } from './MenuContext';
import type { MenuItemProps } from './MenuItem.vue';
import type { SubMenuProps } from './SubMenu.vue';
export type { MenuItemGroupProps } from '@/vc-component/menu';
export type { MenuDividerProps } from './MenuDivider.vue';
export type { MenuItemProps, MenuProps, MenuTheme, SubMenuProps };

export type MenuRef = {
  menu: RcMenuRef | null;
  focus: (options?: FocusOptions) => void;
};

export default Menu;
