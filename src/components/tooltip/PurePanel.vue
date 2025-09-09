<script lang="tsx" setup>
import { Popup } from '@/vc-component/tooltip';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { useConfigContextInject } from '../config-provider';
import Render from '../render';
import type { TooltipProps } from './index.vue';
import useStyle from './style';
import { parseColor } from './util';

/** @private Internal Component. Do not use in your production. */
export type PurePanelProps = TooltipProps;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls: customizePrefixCls, class: className, placement = 'top', title, color } = defineProps<PurePanelProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('tooltip', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);

// Color
const colorInfo = computed(() => parseColor(prefixCls.value, color));

const arrowContentStyle = computed(() => colorInfo.value.arrowStyle);

const formattedOverlayInnerStyle = computed<CSSProperties>(() => {
  return {
    ...colorInfo?.value?.overlayStyle,
  };
});

const cls = computed(() => {
  return clsx(
    hashId.value,
    cssVarCls.value,
    prefixCls.value,
    `${prefixCls.value}-pure`,
    `${prefixCls.value}-placement-${placement}`,
    className,
    colorInfo?.value?.className,
  );
});
</script>
<template>
  <div :class="cls" :style="arrowContentStyle">
    <div :class="`${prefixCls}-arrow`"></div>
    <Popup v-bind="$props" :class="hashId" :prefix-cls="prefixCls" :overlay-inner-style="formattedOverlayInnerStyle">
      <Render :content="title" />
    </Popup>
  </div>
</template>
