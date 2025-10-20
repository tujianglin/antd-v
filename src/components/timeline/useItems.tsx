import { LoadingOutlined } from '@ant-design/icons-vue';

import clsx from 'clsx';
import { computed, type ComputedRef, type Ref, type VNode } from 'vue';
import type { TimelineItemType, TimelineMode } from './Timeline.vue';

export default function useItems(
  prefixCls: Ref<string>,
  mode: Ref<TimelineMode>,
  items?: Ref<TimelineItemType[]>,
  children?: VNode[],
): ComputedRef<TimelineItemType[]> {
  const itemCls = computed(() => `${prefixCls.value}-item`);

  // Merge items and children
  const parseItems = computed(() => {
    return Array.isArray(items.value)
      ? items.value
      : children.map((ele) => ({
          ...ele.props,
        }));
  });

  // convert legacy type
  return computed(() => {
    const mergedItems: TimelineItemType[] = parseItems.value.map((item, index) => {
      const {
        label,
        children,
        title,
        content,
        color,
        class: className,
        style,
        icon,
        dot,
        placement,
        position,
        loading,
        ...restProps
      } = item;

      let mergedStyle = style;
      let mergedClassName = className;

      // Color
      if (color) {
        if (['blue', 'red', 'green', 'gray'].includes(color)) {
          mergedClassName = clsx(className, `${itemCls.value}-color-${color}`);
        } else {
          mergedStyle = {
            '--steps-item-icon-dot-color': color,
            ...style,
          };
        }
      }

      // Placement
      const mergedPlacement =
        placement ?? position ?? (mode.value === 'alternate' ? (index % 2 === 0 ? 'start' : 'end') : mode.value);

      mergedClassName = clsx(mergedClassName, `${itemCls.value}-placement-${mergedPlacement}`);

      // Icon
      let mergedIcon = icon ?? dot;
      if (!mergedIcon && loading) {
        mergedIcon = <LoadingOutlined />;
      }

      return {
        ...restProps,
        title: title ?? label,
        content: content ?? children,
        style: mergedStyle,
        class: mergedClassName,
        icon: mergedIcon,
        status: loading ? 'process' : 'finish',
      };
    });

    return mergedItems;
  });
}
