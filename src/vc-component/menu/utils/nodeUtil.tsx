import { Render } from '@/components';
import type { VNode } from 'vue';
import Divider from '../Divider.vue';
import type { Components, ItemType } from '../interface';
import MenuItem from '../MenuItem/MenuItem.vue';
import MenuItemGroup from '../MenuItemGroup/index.vue';
import SubMenu from '../SubMenu/index.vue';
import { parseChildren } from './commonUtil';

function convertItemsToNodes(list: ItemType[], components: Required<Components>, prefixCls?: string) {
  const { item: MergedMenuItem, group: MergedMenuItemGroup, submenu: MergedSubMenu, divider: MergedDivider } = components;

  return (list || [])
    .map((opt, index) => {
      if (opt && typeof opt === 'object') {
        const { label, children, key, type, extra, ...restProps } = opt as any;
        const mergedKey = key ?? `tmp-${index}`;
        // MenuItemGroup & SubMenuItem
        if (children || type === 'group') {
          if (type === 'group') {
            // Group
            return (
              <MergedMenuItemGroup eventKey={mergedKey} {...restProps} title={label}>
                {convertItemsToNodes(children, components, prefixCls)}
              </MergedMenuItemGroup>
            );
          }
          // Sub Menu
          return (
            <MergedSubMenu eventKey={mergedKey} {...restProps} title={label}>
              {convertItemsToNodes(children, components, prefixCls)}
            </MergedSubMenu>
          );
        }

        // MenuItem & Divider
        if (type === 'divider') {
          return <MergedDivider eventKey={mergedKey} {...restProps} />;
        }

        return (
          <MergedMenuItem eventKey={mergedKey} {...restProps} extra={extra}>
            <Render content={label}></Render>
            {(!!extra || extra === 0) && <span class={`${prefixCls}-item-extra`}>{extra}</span>}
          </MergedMenuItem>
        );
      }

      return null;
    })
    .filter((opt) => opt);
}

export function parseItems(
  children: VNode[],
  items: ItemType[] | undefined,
  keyPath: string[],
  components: Components,
  prefixCls?: string,
) {
  let childNodes = children;

  const mergedComponents: Required<Components> = {
    divider: Divider,
    item: MenuItem,
    group: MenuItemGroup,
    submenu: SubMenu,
    ...components,
  };

  if (items) {
    childNodes = convertItemsToNodes(items, mergedComponents, prefixCls);
  }

  return parseChildren(childNodes, keyPath);
}
