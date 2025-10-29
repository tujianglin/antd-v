<script lang="tsx" setup>
import { computed, toRefs, type VNode } from 'vue';
import { SubMenu as RcSubMenu, useFullPath } from '@/vc-component/menu';
import { useZIndex } from '../_util/hooks/useZIndex';
import type { SubMenuType } from './interface';
import { MenuContextProvider, useMenuContextInject, type MenuContextProps } from './MenuContext';
import type { VueNode } from '@/vc-util/type';
import { omit } from 'lodash-es';
import clsx from 'clsx';
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import Render from '@/vc-component/render';

export interface SubMenuProps extends Omit<SubMenuType, 'ref' | 'key' | 'children' | 'label'> {
  title?: VueNode;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { popupClassName, icon, title: customTitle, theme: customTheme } = defineProps<SubMenuProps>();

const slots = defineSlots<{
  title: () => VNode[];
}>();

const title = computed(() => slots.title?.() || customTitle);

const context = useMenuContextInject();
const { prefixCls, inlineCollapsed, theme: contextTheme, classNames, styles } = toRefs(context);

const parentPath = useFullPath();

const titleNode = () => {
  let result: VueNode;

  if (!icon) {
    result =
      inlineCollapsed.value && !parentPath.value.length && title.value && typeof title.value === 'string' ? (
        <div class={`${prefixCls.value}-inline-collapsed-noicon`}>{title.value.charAt(0)}</div>
      ) : (
        <span class={`${prefixCls.value}-title-content`}>
          <Render content={title.value}></Render>
        </span>
      );
  } else {
    // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
    // ref: https://github.com/ant-design/ant-design/pull/23456
    const titleIsSpan = isValidElement(title.value) && (title.value as any).type === 'span';
    result = (
      <>
        {cloneElement(icon, (oriProps) => ({
          class: clsx(oriProps.className, `${prefixCls.value}-item-icon`, classNames.value.itemIcon),
          style: { ...oriProps.style, ...styles.value.itemIcon },
        }))}
        {titleIsSpan ? (
          <Render content={title.value}></Render>
        ) : (
          <span class={`${prefixCls.value}-title-content`}>
            <Render content={title.value}></Render>
          </span>
        )}
      </>
    );
  }
  return result;
};

const contextValue = computed<MenuContextProps>(() => ({ ...(context as any), firstLevel: false }));

// ============================ zIndex ============================
const [zIndex] = useZIndex('Menu');
</script>
<template>
  <MenuContextProvider :value="contextValue">
    <RcSubMenu
      v-bind="{ ...omit($props, ['icon']), ...$attrs }"
      :title="titleNode"
      :class-names="{
        list: classNames.subMenu.list,
        listTitle: classNames.subMenu.itemTitle,
      }"
      :styles="{
        list: styles.subMenu.list,
        listTitle: styles.subMenu.itemTitle,
      }"
      :popup-class-name="clsx(prefixCls, popupClassName, classNames.popup.root, `${prefixCls}-${customTheme || contextTheme}`)"
      :popup-style="{
        zIndex,
        // fix: https://github.com/ant-design/ant-design/issues/47826#issuecomment-2360737237
        ...$props.popupStyle,
        ...styles.popup.root,
      }"
    >
      <slot></slot>
    </RcSubMenu>
  </MenuContextProvider>
</template>
