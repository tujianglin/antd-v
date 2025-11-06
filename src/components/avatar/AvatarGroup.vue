<script lang="tsx" setup>
import { cloneVNode, computed, toRefs, useSlots, type CSSProperties } from 'vue';
import { useConfigContextInject } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { PopoverProps } from '../popover/index.vue';
import { AvatarContextProvider, type AvatarSize } from './AvatarContext';
import useStyle from './style';
import clsx from 'clsx';
import { toArray } from '@/vc-util/Children/toArray';
import Popover from '../popover';
import Avatar from './Avatar.vue';

export interface AvatarGroupProps {
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  prefixCls?: string;
  max?: {
    count?: number;
    style?: CSSProperties;
    popover?: PopoverProps;
  };
  /*
   * Size of avatar, options: `large`, `small`, `default`
   * or a custom number size
   * */
  size?: AvatarSize;
  shape?: 'circle' | 'square';
}

defineOptions({ name: 'AvatarGroup', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  size,
  shape,
  max,
} = defineProps<AvatarGroupProps>();

const { getPrefixCls, direction } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('avatar', customizePrefixCls));
const groupPrefixCls = computed(() => `${prefixCls.value}-group`);
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const cls = computed(() =>
  clsx(
    groupPrefixCls.value,
    {
      [`${groupPrefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    cssVarCls.value,
    rootCls.value,
    className,
    rootClassName,
    hashId.value,
  ),
);

const slots = useSlots();
const childrenWithProps = computed(() => {
  return toArray(slots.default?.()).map((child, index) =>
    cloneVNode(child, {
      key: `avatar-key-${index}`,
    }),
  );
});

const ChildrenShow = () => {
  const numOfChildren = childrenWithProps.value.length;
  if (max?.count && max.count < numOfChildren) {
    const childrenShow = childrenWithProps.value.slice(0, max.count);
    const childrenHidden = childrenWithProps.value.slice(max.count, numOfChildren);

    const mergePopoverTrigger = max?.popover?.trigger || 'hover';
    const mergePopoverPlacement = max?.popover?.placement || 'top';

    const popoverProps = {
      content: childrenHidden,
      ...max?.popover,
      placement: mergePopoverPlacement,
      trigger: mergePopoverTrigger,
      rootClassName: clsx(`${groupPrefixCls.value}-popover`, max?.popover?.rootClassName),
    };

    childrenShow.push(
      <Popover key="avatar-popover-key" destroyOnHidden {...popoverProps}>
        <Avatar style={max?.style}>{`+${numOfChildren - max.count}`}</Avatar>
      </Popover>,
    );

    return (
      <AvatarContextProvider value={{ shape, size }}>
        <div class={cls.value} style={style}>
          {childrenShow}
        </div>
      </AvatarContextProvider>
    );
  }
  return (
    <AvatarContextProvider value={{ shape, size }}>
      <div class={cls.value} style={style}>
        {childrenWithProps.value}
      </div>
    </AvatarContextProvider>
  );
};
</script>
<template>
  <ChildrenShow />
</template>
