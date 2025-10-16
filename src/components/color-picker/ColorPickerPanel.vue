<script lang="tsx" setup>
import { computed } from 'vue';
import Divider from '../divider/index.vue';
import PanelPicker from './components/PanelPicker/index.vue';
import PanelPresets from './components/PanelPresets.vue';
import {
  PanelPickerContextProvider,
  PanelPresetsContextProvider,
  type PanelPickerContextProps,
  type PanelPresetsContextProps,
} from './context';
import type { ColorPickerProps } from './interface';
import Render from '@/vc-component/render';
import { isArray } from 'lodash-es';

export interface ColorPickerPanelProps extends PanelPickerContextProps, Omit<PanelPresetsContextProps, 'onChange'> {
  onClear?: () => void;
  panelRender?: ColorPickerProps['panelRender'];
}

defineOptions({ name: 'ColorPickerPanel', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  presets,
  panelRender,
  value,
  onChange,
  onClear,
  allowClear,
  disabledAlpha,
  mode = 'single',
  modeOptions,
  onChangeComplete,
  activeIndex,
  onActive,
  format,
  onFormatChange,
  gradientDragging,
  onGradientDragging,
  disabledFormat,
} = defineProps<ColorPickerPanelProps>();
const colorPickerPanelPrefixCls = computed(() => `${prefixCls}-inner`);

// ===================== Context ======================
const panelContext = computed<PanelPickerContextProps>(() => ({
  prefixCls,
  value,
  onChange,
  onClear,
  allowClear,
  disabledAlpha,
  mode,
  modeOptions,
  onChangeComplete,
  activeIndex,
  onActive,
  format,
  onFormatChange,
  gradientDragging,
  onGradientDragging,
  disabledFormat,
}));

const presetContext = computed<PanelPresetsContextProps>(() => ({
  prefixCls,
  value,
  presets,
  onChange,
}));

// ====================== Render ======================
const innerPanel = () => (
  <div class={`${colorPickerPanelPrefixCls.value}-content`}>
    <PanelPicker />
    {isArray(presets) && <Divider />}
    <PanelPresets />
  </div>
);
</script>
<template>
  <PanelPickerContextProvider :value="panelContext">
    <PanelPresetsContextProvider :value="presetContext">
      <div :class="colorPickerPanelPrefixCls">
        <Render
          :content="
            typeof panelRender === 'function'
              ? panelRender(innerPanel(), {
                  components: {
                    Picker: PanelPicker,
                    Presets: PanelPresets,
                  },
                })
              : innerPanel
          "
        />
      </div>
    </PanelPresetsContextProvider>
  </PanelPickerContextProvider>
</template>
