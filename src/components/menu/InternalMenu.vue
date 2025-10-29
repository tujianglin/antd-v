<script lang="tsx" setup>
import type { MenuProps as RcMenuProps } from '@/vc-component/menu';
import RcMenu from '@/vc-component/menu';
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import { EllipsisOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import { isEmpty, omit } from 'lodash-es';
import { computed, getCurrentInstance, h, toRefs, type CSSProperties } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import initCollapseMotion from '../_util/motion';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { SiderContextProps } from '../layout/context';
import type { ItemType } from './interface';
import {
  MenuContextProvider,
  OverrideContextProvider,
  useOverrideContextInject,
  type MenuContextProps,
  type MenuTheme,
} from './MenuContext';
import Divider from './MenuDivider.vue';
import MenuItem from './MenuItem.vue';
import useStyle from './style';
import SubMenu from './SubMenu.vue';

export type SemanticName = 'root' | 'itemTitle' | 'list' | 'item' | 'itemIcon' | 'itemContent';

export type SubMenuName = 'item' | 'itemTitle' | 'list' | 'itemContent' | 'itemIcon';

export interface MenuProps
  extends Omit<RcMenuProps, 'items' | '_internalComponents' | 'classNames' | 'styles' | 'activeKey' | 'defaultActiveFirst'> {
  theme?: MenuTheme;
  inlineIndent?: number;

  // >>>>> Private
  /**
   * @private Internal Usage. Not promise crash if used in production. Connect with chenshuai2144
   *   for removing.
   */
  // eslint-disable-next-line vue/prop-name-casing
  _internalDisableMenuItemTitleTooltip?: boolean;

  items?: ItemType[];
  classNames?: Partial<
    Record<SemanticName, string> & {
      popup?: string | { root?: string };
      subMenu?: Partial<Record<SubMenuName, string>>;
    }
  >;
  styles?: Partial<
    Record<SemanticName, CSSProperties> & {
      subMenu?: Partial<Record<SubMenuName, CSSProperties>>;
      popup?: { root?: CSSProperties };
    }
  >;
}

type InternalMenuProps = MenuProps &
  SiderContextProps & {
    collapsedWidth?: string | number;
  };

defineOptions({ name: 'Menu', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  style,
  theme = 'light',
  expandIcon,
  _internalDisableMenuItemTitleTooltip,
  inlineCollapsed = undefined,
  siderCollapsed,
  rootClassName,
  mode,
  selectable,
  onClick,
  overflowedIndicatorPopupClassName,
  classNames,
  styles,
  ...restProps
} = defineProps<InternalMenuProps>();

const selectedKeys = defineModel<any[]>('selectedKeys');
const openKeys = defineModel('openKeys', { default: [] });

function isEmptyIcon(icon?: VueNode | boolean) {
  return icon === null || icon === false;
}

const MENU_COMPONENTS = {
  item: MenuItem,
  submenu: SubMenu,
  divider: Divider,
};

const overrideObj = useOverrideContextInject();

const { menu } = toRefs(useConfigContextInject());

const {
  getPrefixCls,
  getPopupContainer,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('menu'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    popup: {
      _default: 'root',
    },
    subMenu: {
      _default: 'root',
    },
  })),
);

const rootPrefixCls = computed(() => getPrefixCls.value());

const passedProps = computed(() => omit(restProps, ['collapsedWidth']));

overrideObj.validator?.({ mode });

// ========================== Click ==========================
// Tell dropdown that item clicked
const onItemClick = (e) => {
  onClick?.(e);
  overrideObj.onClick?.();
};

// ========================== Mode ===========================
const mergedMode = computed(() => overrideObj.mode || mode);

// ======================= Selectable ========================
const mergedSelectable = computed(() => selectable ?? overrideObj.selectable);

// ======================== Collapsed ========================
// Inline Collapsed
const mergedInlineCollapsed = computed(() => inlineCollapsed ?? siderCollapsed);

const defaultMotions = computed<MenuProps['defaultMotions']>(() => ({
  horizontal: { motionName: `${rootPrefixCls.value}-slide-up` },
  inline: initCollapseMotion(rootPrefixCls.value),
  other: { motionName: `${rootPrefixCls.value}-zoom-big` },
}));

const prefixCls = computed(() => getPrefixCls.value('menu', customizePrefixCls || overrideObj.prefixCls));
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls, isEmpty(overrideObj));
const menuClassName = computed(() => clsx(`${prefixCls.value}-${theme}`, contextClassName?.value, className));

// ====================== ExpandIcon ========================
const mergedExpandIcon = computed<MenuProps['expandIcon']>(() => {
  if (typeof expandIcon === 'function' || isEmptyIcon(expandIcon)) {
    return expandIcon || null;
  }
  if (typeof overrideObj.expandIcon === 'function' || isEmptyIcon(overrideObj.expandIcon)) {
    return overrideObj.expandIcon || null;
  }
  if (typeof menu?.value?.expandIcon === 'function' || isEmptyIcon(menu?.value?.expandIcon)) {
    return menu?.value?.expandIcon || null;
  }
  const mergedIcon = expandIcon ?? overrideObj?.expandIcon ?? menu?.value?.expandIcon;
  return cloneElement(mergedIcon, {
    class: clsx(`${prefixCls.value}-submenu-expand-icon`, isValidElement(mergedIcon) ? mergedIcon.props?.class : undefined),
  });
});

// ======================== Context ==========================
const contextValue = computed(() => {
  return {
    prefixCls: prefixCls.value,
    inlineCollapsed: mergedInlineCollapsed.value || false,
    direction: direction?.value,
    firstLevel: true,
    theme,
    mode: mergedMode.value,
    disableMenuItemTitleTooltip: _internalDisableMenuItemTitleTooltip,
    classNames: mergedClassNames?.value,
    styles: mergedStyles?.value,
  } as MenuContextProps;
});

const vm = getCurrentInstance();
const changeRef = (el) => {
  vm.exposed = el;
  vm.exposeProxy = el;
};
</script>
<template>
  <OverrideContextProvider :value="{}">
    <MenuContextProvider :value="contextValue">
      <RcMenu
        :ref="changeRef"
        :get-popup-container="getPopupContainer"
        :overflowed-indicator="() => h(EllipsisOutlined)"
        :overflowed-indicator-popup-class-name="clsx(prefixCls, `${prefixCls}-${theme}`, overflowedIndicatorPopupClassName)"
        :class-names="{
          list: mergedClassNames.list,
          listTitle: mergedClassNames.itemTitle,
        }"
        :styles="{
          list: mergedStyles.list,
          listTitle: mergedStyles.itemTitle,
        }"
        :mode="mergedMode"
        :selectable="mergedSelectable"
        @click="onItemClick"
        v-bind="passedProps"
        :inline-collapsed="mergedInlineCollapsed"
        :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
        :class="menuClassName"
        :prefix-cls="prefixCls"
        :direction="direction"
        :default-motions="defaultMotions"
        :expand-icon="mergedExpandIcon"
        :root-class-name="clsx(rootClassName, hashId, overrideObj.rootClassName, cssVarCls, rootCls, mergedClassNames.root)"
        :_internal-components="MENU_COMPONENTS"
        v-model:selected-keys="selectedKeys"
        v-model:open-keys="openKeys"
      >
        <slot></slot>
      </RcMenu>
    </MenuContextProvider>
  </OverrideContextProvider>
</template>
