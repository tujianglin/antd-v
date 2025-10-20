<script lang="tsx" setup>
import type { TourProps as RcTourProps } from '@/vc-component/tour';
import RCTour from '@/vc-component/tour';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useZIndex } from '../_util/hooks/useZIndex';
import getPlacements from '../_util/placements';
import { useComponentConfig } from '../config-provider/context';
import { useToken } from '../theme/internal';
import type { TourProps } from './interface';
import TourPanel from './panelRender.vue';
import useStyle from './style';
import { computed, toRefs } from 'vue';
import clsx from 'clsx';
import { ZIndexContextProvider } from '../_util/zindexContext';

defineOptions({ name: 'Tour', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  type = 'default',
  rootClassName,
  indicatorsRender,
  actionsRender,
  steps,
  closeIcon,
  classNames: tourClassNames,
  styles,
  class: className,
  style,
  mask = true,
  arrow = true,
  ...restProps
} = defineProps<TourProps>();

const open = defineModel('open', { default: false });
const current = defineModel<number>('current');

const {
  getPrefixCls,
  direction,
  closeIcon: contextCloseIcon,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('tour'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, tourClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const prefixCls = computed(() => getPrefixCls.value('tour', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);
const [, token] = useToken();

const mergedSteps = computed<TourProps['steps']>(() =>
  steps?.map((step) => ({
    ...step,
    class: clsx(step.class, {
      [`${prefixCls.value}-primary`]: (step.type ?? type) === 'primary',
    }),
  })),
);

const builtinPlacements: TourProps['builtinPlacements'] = (config) =>
  getPlacements({
    arrowPointAtCenter: config?.arrowPointAtCenter ?? true,
    autoAdjustOverflow: true,
    offset: token?.value?.marginXXS,
    arrowWidth: token?.value?.sizePopupArrow,
    borderRadius: token?.value?.borderRadius,
  });

const customClassName = computed(() =>
  clsx(
    {
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    hashId.value,
    cssVarCls.value,
    rootClassName,
    contextClassName?.value,
    mergedClassNames?.value?.root,
    className,
  ),
);

const semanticStyles = computed(() => ({
  ...mergedStyles?.value,
  mask: {
    ...mergedStyles?.value?.root,
    ...mergedStyles?.value?.mask,
    ...contextStyle?.value,
    ...style,
  },
}));

const mergedRenderPanel: RcTourProps['renderPanel'] = (stepProps, stepCurrent) => (
  <TourPanel
    styles={semanticStyles?.value}
    classNames={mergedClassNames?.value}
    type={type}
    stepProps={stepProps}
    current={stepCurrent}
    indicatorsRender={indicatorsRender}
    actionsRender={actionsRender}
  />
);

// ============================ zIndex ============================
const [zIndex, contextZIndex] = useZIndex(
  'Tour',
  computed(() => restProps.zIndex),
);
</script>
<template>
  <ZIndexContextProvider :value="contextZIndex">
    <RCTour
      v-bind="restProps"
      v-model:current="current"
      v-model:open="open"
      :mask="mask"
      :arrow="arrow"
      :styles="semanticStyles"
      :class-names="mergedClassNames"
      :close-icon="closeIcon ?? contextCloseIcon"
      :z-index="zIndex"
      :root-class-name="customClassName"
      :prefix-cls="prefixCls"
      animated
      :render-panel="mergedRenderPanel"
      :builtin-placements="builtinPlacements"
      :steps="mergedSteps"
    />
  </ZIndexContextProvider>
</template>
