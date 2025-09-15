import Divider from './Divider.vue';
import type { MenuProps } from './Menu.vue';
import Menu from './Menu.vue';
import type { MenuItemProps } from './MenuItem/MenuItem.vue';
import MenuItem from './MenuItem/MenuItem.vue';
import type { MenuItemGroupProps } from './MenuItemGroup/index.vue';
import MenuItemGroup from './MenuItemGroup/index.vue';
import type { SubMenuProps } from './SubMenu/index.vue';
import SubMenu from './SubMenu/index.vue';
import { useFullPath } from './context/PathContext';
import type { MenuRef } from './interface';

export {
  Divider,
  MenuItem as Item,
  MenuItemGroup as ItemGroup,
  MenuItem,
  MenuItemGroup,
  SubMenu,
  /** @private Only used for antd internal. Do not use in your production. */
  useFullPath,
};

export type { MenuItemGroupProps, MenuItemProps, MenuProps, MenuRef, SubMenuProps };

type MenuType = typeof Menu & {
  Item: typeof MenuItem;
  SubMenu: typeof SubMenu;
  ItemGroup: typeof MenuItemGroup;
  Divider: typeof Divider;
};

const ExportMenu = Menu as MenuType;

ExportMenu.Item = MenuItem;
ExportMenu.SubMenu = SubMenu;
ExportMenu.ItemGroup = MenuItemGroup;
ExportMenu.Divider = Divider;

export default ExportMenu;
