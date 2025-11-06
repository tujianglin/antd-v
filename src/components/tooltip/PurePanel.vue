<script lang="tsx" setup>
import Render from '@/vc-component/render';
import { Popup } from '@/vc-component/tooltip';
import clsx from 'clsx';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import { useConfigContextInject } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { TooltipClassNamesType, TooltipProps, TooltipStylesType } from './index.vue';
import useStyle from './style';
import { parseColor } from './util';

/** @private Internal Component. Do not use in your production. */
export type PurePanelProps = TooltipProps;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  placement = 'top',
  title,
  color,
  classNames,
  styles,
} = defineProps<PurePanelProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('tooltip', customizePrefixCls));

const rootCls = useCSSVarCls(prefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

// Color
const colorInfo = computed(() => parseColor(prefixCls.value, color));

const arrowContentStyle = computed(() => colorInfo.value.arrowStyle);

const innerStyles = computed(() => {
  const mergedStyle: CSSProperties = {
    ...colorInfo.value?.overlayStyle,
  };
  return { container: mergedStyle };
});

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<TooltipClassNamesType, TooltipStylesType, TooltipProps>(
  computed(() => [classNames]),
  computed(() => [innerStyles.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      placement,
    },
  })),
);

const rootClassName = computed(() =>
  clsx(
    rootCls.value,
    hashId.value,
    cssVarCls.value,
    prefixCls.value,
    `${prefixCls.value}-pure`,
    `${prefixCls.value}-placement-${placement}`,
    className,
    colorInfo?.value?.className,
  ),
);
</script>
<template>
  <div :class="rootClassName" :style="arrowContentStyle">
    <div :class="`${prefixCls}-arrow`"></div>
    <Popup v-bind="$props" :class="hashId" :prefix-cls="prefixCls" :class-names="mergedClassNames" :styles="mergedStyles">
      <Render :content="title" />
    </Popup>
  </div>
</template>
