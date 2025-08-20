<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, ref, type CSSProperties, type VNode } from 'vue';
import { Color } from './color';
import ColorBlock from './components/ColorBlock.vue';
import Picker from './components/Picker.vue';
import type { Components } from './hooks/useComponent';
import useComponent from './hooks/useComponent';
import type { BaseColorPickerProps, ColorGenInput } from './interface';
import { ColorPickerPrefixCls, generateColor } from './util';

export interface ColorPickerProps extends Omit<BaseColorPickerProps, 'color'> {
  class?: string;
  style?: CSSProperties;
  /** Get panel element  */
  panelRender?: any;
  /** Disabled alpha selection */
  disabledAlpha?: boolean;
  components?: Components;
}

defineOptions({ name: 'ColorPicker', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = ColorPickerPrefixCls,
  onChange,
  onChangeComplete,
  class: className,
  style,
  panelRender,
  disabledAlpha = false,
  disabled = false,
  components,
} = defineProps<ColorPickerProps>();

const slots = defineSlots<{ panelRender?: (panel: VNode) => VNode }>();

const slotPanelRender = computed(() => {
  return slots.panelRender || panelRender;
});

const HUE_COLORS = [
  {
    color: 'rgb(255, 0, 0)',
    percent: 0,
  },
  {
    color: 'rgb(255, 255, 0)',
    percent: 17,
  },
  {
    color: 'rgb(0, 255, 0)',
    percent: 33,
  },
  {
    color: 'rgb(0, 255, 255)',
    percent: 50,
  },
  {
    color: 'rgb(0, 0, 255)',
    percent: 67,
  },
  {
    color: 'rgb(255, 0, 255)',
    percent: 83,
  },
  {
    color: 'rgb(255, 0, 0)',
    percent: 100,
  },
];

// ========================== Components ==========================
const Slider = useComponent(computed(() => components));

// ============================ Color =============================
const mergedValue = defineModel<ColorGenInput>('value');
const colorValue = computed(() => generateColor(mergedValue.value));
const alphaColor = computed(() => colorValue.value.setA(1).toRgbString());

// ============================ Events ============================
const handleChange: BaseColorPickerProps['onChange'] = (data, type) => {
  mergedValue.value = data;
  onChange?.(data, type);
};

// Convert
const getHueColor = (hue: number) => new Color(colorValue.value.setHue(hue));

const getAlphaColor = (alpha: number) => new Color(colorValue.value.setA(alpha / 100));

// Slider change
const onHueChange = (hue: number) => {
  handleChange(getHueColor(hue), { type: 'hue', value: hue });
};

const onAlphaChange = (alpha: number) => {
  handleChange(getAlphaColor(alpha), { type: 'alpha', value: alpha });
};

// Complete
const onHueChangeComplete = (hue: number) => {
  if (onChangeComplete) {
    onChangeComplete(getHueColor(hue));
  }
};

const onAlphaChangeComplete = (alpha: number) => {
  if (onChangeComplete) {
    onChangeComplete(getAlphaColor(alpha));
  }
};
// ============================ Render ============================
const mergeCls = computed(() => {
  return clsx(`${prefixCls}-panel`, className, {
    [`${prefixCls}-panel-disabled`]: disabled,
  });
});

const sharedSliderProps = computed(() => {
  return {
    prefixCls,
    disabled,
    color: colorValue.value,
  };
});
const domRef = ref(null);

const defaultPanel = () => {
  const res = (
    <>
      <Picker onChange={handleChange} {...sharedSliderProps.value} onChangeComplete={onChangeComplete} />
      <div class={`${prefixCls}-slider-container`}>
        <div
          class={clsx(`${prefixCls}-slider-group`, {
            [`${prefixCls}-slider-group-disabled-alpha`]: disabledAlpha,
          })}
        >
          <Slider.value
            {...sharedSliderProps.value}
            type="hue"
            colors={HUE_COLORS}
            min={0}
            max={359}
            value={colorValue.value.getHue()}
            onChange={onHueChange}
            onChangeComplete={onHueChangeComplete}
          />
          {!disabledAlpha && (
            <Slider.value
              {...sharedSliderProps.value}
              type="alpha"
              colors={[
                { percent: 0, color: 'rgba(255, 0, 4, 0)' },
                { percent: 100, color: alphaColor },
              ]}
              min={0}
              max={100}
              value={colorValue.value.a * 100}
              onChange={onAlphaChange}
              onChangeComplete={onAlphaChangeComplete}
            />
          )}
        </div>
        <ColorBlock color={colorValue.value.toRgbString()} prefixCls={prefixCls} />
      </div>
    </>
  );
  if (slotPanelRender.value) {
    return slotPanelRender.value(res);
  }
  return res;
};
</script>
<template>
  <div :class="mergeCls" :style="style" ref="domRef">
    <defaultPanel />
  </div>
</template>
<style lang="less">
@import './assets/index.less';
</style>
