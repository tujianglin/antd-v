<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs, useSlots, type CSSProperties } from 'vue';
import type { Orientation } from '../_util/hooks/useOrientation';
import useOrientation from '../_util/hooks/useOrientation';
import { useConfigContextInject } from '../config-provider';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import { useSpaceCompactItemContextInject } from './CompactContext';
import CompactItem from './CompactItem.vue';
import useStyle from './style';
import Render from '@/vc-component/render';
import { isEmpty } from 'lodash-es';

export interface SpaceCompactProps {
  class?: string;
  style?: CSSProperties;
  prefixCls?: string;
  size?: SizeType;
  orientation?: Orientation;
  vertical?: boolean;
  block?: boolean;
  rootClassName?: string;
}

const {
  size,
  orientation,
  block,
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  vertical,
  ...restProps
} = defineProps<SpaceCompactProps>();

const { getPrefixCls, direction: directionConfig } = toRefs(useConfigContextInject());

const [mergedOrientation, mergedVertical] = useOrientation(
  computed(() => orientation),
  computed(() => vertical),
);
const mergedSize = useSize(computed(() => (ctx) => size ?? ctx));

const prefixCls = computed(() => getPrefixCls.value('space-compact', customizePrefixCls));
const [hashId] = useStyle(prefixCls);

const cls = computed(() => {
  return clsx(
    prefixCls.value,
    hashId.value,
    {
      [`${prefixCls.value}-rtl`]: directionConfig?.value === 'rtl',
      [`${prefixCls.value}-block`]: block,
      [`${prefixCls.value}-vertical`]: mergedVertical.value,
    },
    className,
    rootClassName,
  );
});

const compactItemContext = useSpaceCompactItemContextInject();

const slots = useSlots();

const nodes = computed(() => {
  const childNodes = slots.default?.() || [];
  return childNodes.map((child, i) => {
    const key = child?.key || `${prefixCls.value}-item-${i}`;
    return (
      <CompactItem
        key={key}
        compactSize={mergedSize.value}
        compactDirection={mergedOrientation.value}
        isFirstItem={i === 0 && (isEmpty(compactItemContext) || compactItemContext?.isFirstItem)}
        isLastItem={i === childNodes.length - 1 && (isEmpty(compactItemContext) || compactItemContext?.isLastItem)}
      >
        {child}
      </CompactItem>
    );
  });
});
</script>
<template>
  <div v-if="nodes.length" :class="cls" v-bind="restProps">
    <Render :content="nodes" />
  </div>
</template>
