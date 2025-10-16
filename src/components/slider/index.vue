<script lang="tsx" setup>
import { cloneVNode, computed, getCurrentInstance, onBeforeUnmount, onMounted, toRefs, type CSSProperties } from 'vue';
import type { Orientation } from '../_util/hooks/useOrientation';
import useOrientation from '../_util/hooks/useOrientation';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import SliderTooltip from './SliderTooltip.vue';
import useStyle from './style';
import useRafLock from './useRafLock';
import type { SliderProps as RcSliderProps } from '@/vc-component/slider';
import type { AbstractTooltipProps, TooltipPlacement } from '../tooltip/index.vue';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { useSliderInternalContextInject } from './Context';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import raf from '@/vc-util/raf';
import RcSlider from '@/vc-component/slider';

export type SliderMarks = RcSliderProps['marks'];

export type SemanticName = 'root' | 'tracks' | 'track' | 'rail' | 'handle';
export type SliderClassNames = Partial<Record<SemanticName, string>>;
export type SliderStyles = Partial<Record<SemanticName, CSSProperties>>;
export interface SliderProps extends RcSliderProps {
  classNames?: SliderClassNames;
  styles?: SliderStyles;
}

interface HandleGeneratorInfo {
  value?: number;
  dragging?: boolean;
  index: number;
}

export type HandleGeneratorFn = (config: { tooltipPrefixCls?: string; prefixCls?: string; info: HandleGeneratorInfo }) => any;

export type Formatter = ((value?: number) => any) | null;

export interface SliderTooltipProps extends AbstractTooltipProps {
  prefixCls?: string;
  open?: boolean;
  placement?: TooltipPlacement;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  formatter?: Formatter;
  autoAdjustOverflow?: boolean;
}

export interface SliderBaseProps {
  prefixCls?: string;
  reverse?: boolean;
  min?: number;
  max?: number;
  step?: null | number;
  marks?: SliderMarks;
  dots?: boolean;
  included?: boolean;
  disabled?: boolean;
  keyboard?: boolean;
  orientation?: Orientation;
  vertical?: boolean;
  class?: string;
  rootClassName?: string;
  id?: string;
  style?: CSSProperties;
  tooltip?: SliderTooltipProps;
  autofocus?: boolean;

  styles?: SliderProps['styles'];
  classNames?: SliderProps['classNames'];
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;

  // Accessibility
  tabindex?: SliderProps['tabindex'];
  ariaLabelForHandle?: SliderProps['ariaLabelForHandle'];
  ariaLabelledByForHandle?: SliderProps['ariaLabelledByForHandle'];
  ariaRequired?: SliderProps['ariaRequired'];
  ariaValueTextFormatterForHandle?: SliderProps['ariaValueTextFormatterForHandle'];
}

export interface SliderSingleProps extends SliderBaseProps {
  range?: boolean | SliderRange;
  onChange?: (value: number | number[]) => void;
  onChangeComplete?: (value: number | number[]) => void;
}

type SliderRange = Exclude<RcSliderProps['range'], boolean>;

export type Opens = { [index: number]: boolean };

defineOptions({ name: 'Slider', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  range,
  class: className,
  rootClassName,
  style,
  disabled,
  // Deprecated Props
  tooltip = {},
  onChangeComplete,
  classNames: sliderClassNames,
  styles,
  vertical,
  orientation,
  included = true,
  ...restProps
} = defineProps<SliderSingleProps>();

const value = defineModel<number | number[]>('value');

function getTipFormatter(tipFormatter?: Formatter) {
  if (tipFormatter || tipFormatter === null) {
    return tipFormatter;
  }
  return (val?: number) => (typeof val === 'number' ? val.toString() : '');
}

const [, mergedVertical] = useOrientation(
  computed(() => orientation),
  computed(() => vertical),
);
const {
  getPrefixCls,
  direction: contextDirection,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  getPopupContainer,
} = toRefs(useComponentConfig('slider'));
const contextDisabled = useDisabledContextInject();
const mergedDisabled = computed(() => disabled ?? contextDisabled.value);

// ============================= Context ==============================
const { handleRender: contextHandleRender, direction: internalContextDirection } = toRefs(useSliderInternalContextInject());

const mergedDirection = computed(() => internalContextDirection?.value || contextDirection?.value);
const isRTL = computed(() => mergedDirection?.value === 'rtl');

// =============================== Open ===============================
const [hoverOpen, setHoverOpen] = useRafLock();
const [focusOpen, setFocusOpen] = useRafLock();

const {
  open: tooltipOpen,
  placement: tooltipPlacement,
  getPopupContainer: getTooltipPopupContainer,
  prefixCls: customizeTooltipPrefixCls,
  formatter: tipFormatter,
} = toRefs(reactiveComputed(() => tooltip));

const lockOpen = computed(() => tooltipOpen?.value);
const activeOpen = computed(() => (hoverOpen?.value || focusOpen?.value) && lockOpen?.value !== false);

const mergedTipFormatter = computed(() => getTipFormatter(tipFormatter?.value));

// ============================= Change ==============================
const [dragging, setDragging] = useRafLock();

const onInternalChangeComplete: RcSliderProps['onChangeComplete'] = (nextValues) => {
  onChangeComplete?.(nextValues as any);
  setDragging(false);
};

// ============================ Placement ============================
const getTooltipPlacement = (placement?: TooltipPlacement, vert?: boolean) => {
  if (placement) {
    return placement;
  }
  if (!vert) {
    return 'top';
  }
  return isRTL?.value ? 'left' : 'right';
};

// ============================== Style ===============================
const prefixCls = computed(() => getPrefixCls.value('slider', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const rootClassNames = computed(() =>
  clsx(
    className,
    contextClassName,
    contextClassNames.value.root,
    sliderClassNames?.root,
    rootClassName,
    {
      [`${prefixCls.value}-rtl`]: isRTL?.value,
      [`${prefixCls.value}-lock`]: dragging?.value,
    },
    hashId.value,
    cssVarCls.value,
  ),
);

const vm = getCurrentInstance();

// ============================= Warning ==============================
// Warning for deprecated usage
if (process.env.NODE_ENV !== 'production') {
  const warning = devUseWarning('Slider');

  [
    ['tooltipPrefixCls', 'prefixCls'],
    ['getTooltipPopupContainer', 'getPopupContainer'],
    ['tipFormatter', 'formatter'],
    ['tooltipPlacement', 'placement'],
    ['tooltipVisible', 'open'],
  ].forEach(([deprecatedName, newName]) => {
    warning.deprecated(!(deprecatedName in vm.props), deprecatedName, `tooltip.${newName}`);
  });
}

// ============================== Handle ==============================

const onMouseUp = () => {
  // Delay for 1 frame to make the click to enable hide tooltip
  // even when the handle is focused
  raf(() => {
    setFocusOpen(false);
  }, 1);
};
onMounted(() => {
  document.addEventListener('mouseup', onMouseUp);
});

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', onMouseUp);
});

const useActiveTooltipHandle = computed(() => range && !lockOpen.value);

const handleRender = computed<RcSliderProps['handleRender']>(() => {
  return (
    contextHandleRender?.value ||
    ((node, info) => {
      const { index } = info;

      const nodeProps = node.props;

      function proxyEvent(eventName, event, triggerRestPropsEvent?: boolean) {
        if (triggerRestPropsEvent) {
          (restProps as any)[eventName]?.(event);
        }

        (nodeProps as any)[eventName]?.(event);
      }

      const passedProps: typeof nodeProps = {
        onMouseenter: (e) => {
          setHoverOpen(true);
          proxyEvent('onMouseenter', e);
        },
        onMouseleave: (e) => {
          setHoverOpen(false);
          proxyEvent('onMouseleave', e);
        },
        onMousedown: (e) => {
          setFocusOpen(true);
          setDragging(true);
          proxyEvent('onMousedown', e);
        },
        onFocus: (e) => {
          setFocusOpen(true);
          restProps.onFocus?.(e);
          proxyEvent('onFocus', e, true);
        },
        onBlur: (e) => {
          setFocusOpen(false);
          restProps.onBlur?.(e);
          proxyEvent('onBlur', e, true);
        },
      };

      const cloneNode = cloneVNode(node, passedProps);

      const open = (!!lockOpen.value || activeOpen.value) && mergedTipFormatter.value !== null;
      // Wrap on handle with Tooltip when is single mode or multiple with all show tooltip
      if (!useActiveTooltipHandle.value && open) {
        return (
          <SliderTooltip
            {...tooltip}
            prefixCls={getPrefixCls.value('tooltip', customizeTooltipPrefixCls?.value)}
            title={mergedTipFormatter?.value ? mergedTipFormatter?.value?.(info.value) : ''}
            value={info.value}
            open={open}
            placement={getTooltipPlacement(tooltipPlacement?.value, mergedVertical.value)}
            key={index}
            classNames={{ root: `${prefixCls.value}-tooltip` }}
            getPopupContainer={getTooltipPopupContainer?.value || getPopupContainer?.value}
          >
            {cloneNode}
          </SliderTooltip>
        );
      }
      return cloneNode;
    })
  );
});

// ========================== Active Handle ===========================
const activeHandleRender = computed<SliderProps['activeHandleRender']>(() => {
  return useActiveTooltipHandle.value
    ? (handle, info) => {
        const cloneNode = cloneVNode(handle, {
          style: {
            ...handle.props.style,
            visibility: 'hidden',
          },
        });

        return (
          <SliderTooltip
            {...tooltip}
            prefixCls={getPrefixCls.value('tooltip', customizeTooltipPrefixCls?.value)}
            title={mergedTipFormatter?.value ? mergedTipFormatter?.value?.(info.value) : ''}
            open={mergedTipFormatter?.value !== null && activeOpen.value}
            placement={getTooltipPlacement(tooltipPlacement?.value, mergedVertical.value)}
            key="tooltip"
            classNames={{ root: `${prefixCls.value}-tooltip` }}
            getPopupContainer={getTooltipPopupContainer?.value || getPopupContainer?.value}
            draggingDelete={info.draggingDelete}
          >
            {cloneNode}
          </SliderTooltip>
        );
      }
    : undefined;
});

// ============================== Render ==============================
const rootStyle = computed<CSSProperties>(() => ({
  ...contextStyles.value.root,
  ...contextStyle?.value,
  ...styles?.root,
  ...style,
}));

const mergedTracks = computed(() => ({
  ...contextStyles.value.tracks,
  ...styles?.tracks,
}));

const mergedTracksClassNames = computed(() => clsx(contextClassNames.value.tracks, sliderClassNames?.tracks));
</script>
<template>
  <RcSlider
    v-bind="restProps"
    :included="included"
    v-model:value="value"
    :class-names="{
      handle: clsx(contextClassNames.handle, sliderClassNames?.handle),
      rail: clsx(contextClassNames.rail, sliderClassNames?.rail),
      track: clsx(contextClassNames.track, sliderClassNames?.track),
      ...(mergedTracksClassNames ? { tracks: mergedTracksClassNames } : {}),
    }"
    :styles="{
      handle: {
        ...contextStyles.handle,
        ...styles?.handle,
      },
      rail: {
        ...contextStyles.rail,
        ...styles?.rail,
      },
      track: {
        ...contextStyles.track,
        ...styles?.track,
      },
      ...(Object.keys(mergedTracks).length ? { tracks: mergedTracks } : {}),
    }"
    :step="restProps.step"
    :range="range"
    :class="rootClassNames"
    :style="rootStyle"
    :disabled="mergedDisabled"
    :vertical="mergedVertical"
    :prefix-cls="prefixCls"
    :handle-render="handleRender"
    :active-handle-render="activeHandleRender"
    @change-complete="onInternalChangeComplete"
  />
</template>
