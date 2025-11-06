<script lang="tsx" setup>
import RcRate from '@/vc-component/rate';
import type { RateProps as RcRateProps } from '@/vc-component/rate/Rate.vue';
import type { StarProps as RcStarProps } from '@/vc-component/rate/Star.vue';
import { useComponentConfig } from '../config-provider/context';
import Tooltip, { type TooltipProps } from '../tooltip';
import useStyle from './style';
import { StarFilled } from '@ant-design/icons-vue';
import { computed, toRefs, useTemplateRef, type CSSProperties } from 'vue';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import clsx from 'clsx';

export interface RateProps extends RcRateProps {
  rootClassName?: string;
  tooltips?: (TooltipProps | string)[];
  size?: 'small' | 'middle' | 'large';
}

defineOptions({ name: 'Rate', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  class: className,
  rootClassName,
  style,
  tooltips,
  allowClear = true,
  character = <StarFilled />,
  disabled: customDisabled = undefined,
  size = 'middle',
  ...rest
} = defineProps<RateProps>();

const value = defineModel('value', { default: 0 });

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value;
  },
});

const isTooltipProps = (item: TooltipProps | string): item is TooltipProps => {
  return typeof item === 'object' && item !== null;
};

const characterRender: RcStarProps['characterRender'] = (node, { index }) => {
  if (!tooltips) {
    return node;
  }

  const tooltipsItem = tooltips[index as number];

  if (isTooltipProps(tooltipsItem)) {
    return <Tooltip {...tooltipsItem}>{node}</Tooltip>;
  }

  return <Tooltip title={tooltipsItem as string}>{node}</Tooltip>;
};

const { getPrefixCls, direction, class: contextClassName, style: contextStyle } = toRefs(useComponentConfig('rate'));

const ratePrefixCls = computed(() => getPrefixCls.value('rate', prefixCls));

// Style
const [hashId, cssVarCls] = useStyle(ratePrefixCls);

const mergedStyle = computed<CSSProperties>(() => ({ ...contextStyle?.value, ...style }));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);
</script>
<template>
  <RcRate
    ref="domRef"
    v-bind="rest"
    v-model:value="value"
    :allow-clear="allowClear"
    :character="character"
    :character-render="characterRender"
    :disabled="mergedDisabled"
    :class="clsx(`${ratePrefixCls}-${size}`, className, rootClassName, hashId, cssVarCls, contextClassName)"
    :style="mergedStyle"
    :prefix-cls="ratePrefixCls"
    :direction="direction"
  />
</template>
