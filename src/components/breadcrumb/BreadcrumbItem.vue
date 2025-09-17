<script lang="tsx" setup>
import type { VueKey, VueNode } from '@/vc-util/type';
import { type CSSProperties } from 'vue';
import type { DropdownProps } from '../dropdown';

export interface SeparatorType {
  separator?: VueNode;
  key?: VueKey;
}

type MenuType = NonNullable<DropdownProps['menu']>;
interface MenuItem {
  key?: VueKey;
  title?: VueNode;
  label?: VueNode;
  path?: string;
  href?: string;
}

export interface BreadcrumbItemProps extends SeparatorType {
  prefixCls?: string;
  href?: string;
  menu?: Omit<MenuType, 'items'> & {
    items?: MenuItem[];
  };
  dropdownProps?: DropdownProps;
  onClick?: (e: MouseEvent) => void;
  class?: string;
  style?: CSSProperties;
  children?: VueNode;
}
</script>
