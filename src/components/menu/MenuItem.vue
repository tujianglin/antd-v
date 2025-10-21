<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs, useSlots } from 'vue';
import type { MenuItemProps as RcMenuItemProps } from '@/vc-component/menu';
import { Item } from '@/vc-component/menu';
import { toArray } from '@/vc-util/Children/toArray';
import Tooltip, { type TooltipProps } from '../tooltip';
import { useMenuContextInject } from './MenuContext';
import type { VueNode } from '@/vc-util/type';
import { omit } from 'lodash-es';
import clsx from 'clsx';
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import { useSiderContextInject } from '../layout/context';
import Render from '@/vc-component/render';

export interface MenuItemProps extends Omit<RcMenuItemProps, 'title'> {
  icon?: VueNode;
  danger?: boolean;
  title?: boolean | VueNode;
}

type MenuItemComponent = MenuItemProps;

type RestArgs<T> = T extends (arg: any, ...args: infer P) => any ? P : never;

type GenericProps<T = unknown> = T extends infer U extends MenuItemProps
  ? unknown extends U
    ? MenuItemProps
    : U
  : MenuItemProps;

type GenericComponent = Omit<MenuItemComponent, ''> &
  (<T extends MenuItemProps>(
    props: GenericProps<T>,
    ...args: RestArgs<MenuItemComponent>
  ) => ReturnType<() => MenuItemComponent>);

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, icon, title, danger, extra } = defineProps<GenericComponent>();
const slots = useSlots();

const {
  prefixCls,
  firstLevel,
  direction,
  disableMenuItemTitleTooltip,
  inlineCollapsed: isInlineCollapsed,
  styles,
  classNames,
} = toRefs(useMenuContextInject());
const renderItemChildren = (inlineCollapsed: boolean) => {
  const children = slots.default?.();
  const label = (children as VueNode[])?.[0];
  const wrapNode = (
    <span
      class={clsx(
        `${prefixCls.value}-title-content`,
        firstLevel.value ? classNames?.value?.itemContent : classNames?.value?.subMenu?.itemContent,
        {
          [`${prefixCls.value}-title-content-with-extra`]: !!extra || extra === 0,
        },
      )}
      style={firstLevel.value ? styles?.value?.itemContent : styles?.value?.subMenu?.itemContent}
    >
      {slots?.default?.()}
    </span>
  );
  // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
  // ref: https://github.com/ant-design/ant-design/pull/23456
  if (!icon || (isValidElement(children) && children[0].type === 'span')) {
    if (children && inlineCollapsed && firstLevel && typeof label === 'string') {
      return <div class={`${prefixCls.value}-inline-collapsed-noicon`}>{label.charAt(0)}</div>;
    }
  }
  return wrapNode;
};

const { siderCollapsed } = toRefs(useSiderContextInject());

const tooltipProps = computed(() => {
  const result: TooltipProps & { open?: boolean } = {};
  if (!siderCollapsed?.value && !isInlineCollapsed.value) {
    result.title = null;
    result.open = false;
  }
  return result;
});

const vm = getCurrentInstance();

const ReturnNode = () => {
  const childrenLength = toArray(slots.default?.()).length;

  return (
    <Item
      {...omit(vm.props, ['title', 'icon', 'danger'])}
      class={clsx(
        firstLevel.value ? classNames.value.item : classNames.value.subMenu.item,
        {
          [`${prefixCls.value}-item-danger`]: danger,
          [`${prefixCls.value}-item-only-child`]: (icon ? childrenLength + 1 : childrenLength) === 1,
        },
        className,
      )}
      style={firstLevel.value ? styles.value.item : styles.value.subMenu.item}
      title={typeof title === 'string' ? title : undefined}
    >
      {cloneElement(icon, (oriProps) => ({
        class: clsx(
          oriProps.className,
          `${prefixCls.value}-item-icon`,
          firstLevel.value ? classNames.value.itemIcon : classNames.value.subMenu.itemIcon,
        ),
        style: {
          ...oriProps.style,
          ...(firstLevel.value ? styles.value.itemIcon : styles.value.subMenu.itemIcon),
        },
      }))}
      {renderItemChildren(isInlineCollapsed.value)}
    </Item>
  );
};
</script>
<template>
  <Tooltip
    v-if="!disableMenuItemTitleTooltip"
    v-bind="tooltipProps"
    :placement="direction === 'rtl' ? 'left' : 'right'"
    :class-names="{ root: `${prefixCls}-inline-collapsed-tooltip` }"
  >
    <template #title>
      <template v-if="typeof title === 'undefined'">
        <template v-if="firstLevel"><slot></slot></template>
      </template>
      <template v-else-if="title === false"></template>
      <template v-else>
        <slot name="title">
          <Render :content="title" />
        </slot>
      </template>
    </template>
    <ReturnNode />
  </Tooltip>
  <ReturnNode v-else />
</template>
