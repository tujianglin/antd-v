<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import { computed, type CSSProperties } from 'vue';
import type { Orientation } from '../_util/hooks/useOrientation';
import useOrientation from '../_util/hooks/useOrientation';
import { useConfigContextInject } from '../config-provider';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import {
  SpaceCompactItemContextProvider,
  useSpaceCompactItemContextInject,
  type SpaceCompactItemContextType,
} from './CompactContext';
import useStyle from './style';
import { extractValidChildren, propsToCamelCase } from '../_util/type';

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

const props = defineProps<SpaceCompactProps>();

const config = useConfigContextInject();

const merged = useOrientation(
  computed(() => props.orientation),
  computed(() => props.vertical),
);
const mergedSize = computed(() => useSize((ctx) => props.size ?? ctx));

const prefixCls = config.getPrefixCls('space-compact', props.class);
const [hashId] = useStyle(prefixCls);

const cls = computed(() => {
  return cn(
    prefixCls,
    hashId,
    {
      [`${prefixCls}-rtl`]: config.direction === 'rtl',
      [`${prefixCls}-block`]: props.block,
      [`${prefixCls}-vertical`]: merged.mergedVertical,
    },
    props.class,
    props.rootClassName,
  );
});

const compactItemContext = useSpaceCompactItemContextInject();

const CompactItem = (props: SpaceCompactItemContextType, { slots }) => {
  return <SpaceCompactItemContextProvider value={propsToCamelCase(props)}>{slots.default?.()}</SpaceCompactItemContextProvider>;
};
</script>
<template>
  <div :class="cls" :style="style">
    <CompactItem
      v-for="(child, index) in extractValidChildren($slots.default?.())"
      :key="(child as any).key || `${prefixCls}-item-${index}`"
      :compact-size="mergedSize"
      :compact-direction="merged.mergedOrientation"
      :is-first-item="index === 0 && (!compactItemContext || compactItemContext?.isFirstItem)"
      :is-last-item="
        index === extractValidChildren($slots.default?.()).length - 1 && (!compactItemContext || compactItemContext?.isLastItem)
      "
    >
      <component :is="child" />
    </CompactItem>
  </div>
</template>
