<script lang="tsx" setup>
import type { BaseSliderProps } from '@/vc-component/color-picker';
import { UnstableContextProvider, type UnstableContextProps } from '@/vc-component/slider/context';
import clsx from 'clsx';
import { cloneVNode, computed } from 'vue';
import Slider from '../../slider';
import { SliderInternalContextProvider, type SliderInternalContextProps } from '../../slider/Context';
import { getGradientPercentColor } from '../util';

export interface GradientColorSliderProps extends Omit<BaseSliderProps, 'value' | 'onChange' | 'onChangeComplete' | 'type'> {
  value: number[];
  onChange?: (value) => void;
  onChangeComplete: (value) => void;
  range?: boolean;
  class?: string;
  activeIndex?: number;
  onActive?: (index: number) => void;
  type: BaseSliderProps['type'] | 'gradient';

  // Drag events
  onDragStart?: UnstableContextProps['onDragStart'];
  onDragChange?: UnstableContextProps['onDragChange'];

  // Key event
  onKeyDelete?: (index: number) => void;
}

const {
  prefixCls,
  colors,
  type,
  color,
  range = false,
  class: className,
  activeIndex,
  onActive,

  onDragStart,
  onDragChange,
  onKeyDelete,

  ...restProps
} = defineProps<GradientColorSliderProps>();

const sliderProps = computed(() => ({
  ...restProps,
  track: false,
}));

// ========================== Background ==========================
const linearCss = computed(() => {
  const colorsStr = colors.map((c) => `${c.color} ${c.percent}%`).join(', ');
  return `linear-gradient(90deg, ${colorsStr})`;
});

const pointColor = computed(() => {
  if (!color || !type) {
    return null;
  }

  if (type === 'alpha') {
    return color.toRgbString();
  }

  return `hsl(${color.toHsb().h}, 100%, 50%)`;
});

// ======================= Context: Slider ========================

const unstableContext = computed(() => ({
  onDragStart,
  onDragChange,
}));

// ======================= Context: Render ========================
const handleRender: SliderInternalContextProps['handleRender'] = (ori, info) => {
  const { onFocus, style, class: handleCls, onKeydown } = ori.props;

  // Point Color
  const mergedStyle = { ...style };
  if (type === 'gradient') {
    mergedStyle.background = getGradientPercentColor(colors, info.value);
  }

  return cloneVNode(ori, {
    onFocus: (e: FocusEvent) => {
      onActive?.(info.index);
      onFocus?.(e);
    },
    style: mergedStyle,
    class: clsx(handleCls, {
      [`${prefixCls}-slider-handle-active`]: activeIndex === info.index,
    }),
    onKeydown: (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && onKeyDelete) {
        onKeyDelete(info.index);
      }

      onKeydown?.(e);
    },
  });
};

const sliderContext = computed<SliderInternalContextProps>(() => ({
  direction: 'ltr',
  handleRender,
}));
</script>
<template>
  <SliderInternalContextProvider :value="sliderContext">
    <UnstableContextProvider :value="unstableContext">
      <Slider
        v-bind="sliderProps"
        :class="clsx(className, `${prefixCls}-slider`)"
        :tooltip="{ open: false }"
        :range="{
          editable: range,
          minCount: 2,
        }"
        :styles="{
          rail: {
            background: linearCss,
          },
          handle: pointColor
            ? {
                background: pointColor,
              }
            : {},
        }"
        :class-names="{
          rail: `${prefixCls}-slider-rail`,
          handle: `${prefixCls}-slider-handle`,
        }"
      />
    </UnstableContextProvider>
  </SliderInternalContextProvider>
</template>
