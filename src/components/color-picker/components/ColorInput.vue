<script lang="tsx" setup>
import { computed, ref, watchEffect } from 'vue';
import Select from '../../select';
import type { DefaultOptionType } from '../../select/index.vue';
import type { AggregationColor } from '../color';
import type { ColorFormatType } from '../interface';
import { FORMAT_HEX, FORMAT_HSB, FORMAT_RGB } from '../interface';
import ColorAlphaInput from './ColorAlphaInput.vue';
import ColorHexInput from './ColorHexInput.vue';
import ColorHsbInput from './ColorHsbInput.vue';
import ColorRgbInput from './ColorRgbInput.vue';

interface ColorInputProps {
  prefixCls: string;
  format?: ColorFormatType;
  onFormatChange?: (format: ColorFormatType) => void;
  disabledAlpha?: boolean;
  value?: AggregationColor;
  onChange?: (value: AggregationColor) => void;
  disabledFormat?: boolean;
}

const { prefixCls, format, value, disabledAlpha, onFormatChange, onChange, disabledFormat } = defineProps<ColorInputProps>();

const selectOptions = computed(() =>
  [FORMAT_HEX, FORMAT_HSB, FORMAT_RGB].map<DefaultOptionType>((format) => ({
    value: format,
    label: format.toUpperCase(),
  })),
);

const colorFormat = ref(format || FORMAT_HEX);

watchEffect(() => {
  onFormatChange(colorFormat.value);
});

const colorInputPrefixCls = computed(() => `${prefixCls}-input`);

const handleFormatChange = (newFormat: ColorFormatType) => {
  colorFormat.value = newFormat;
};

const inputProps = computed(() => ({ value, prefixCls, onChange }));
</script>
<template>
  <div :class="`${colorInputPrefixCls}-container`">
    <Select
      v-if="!disabledFormat"
      v-model:value="colorFormat"
      variant="borderless"
      :get-popup-container="(current) => current"
      :popup-match-select-width="68"
      placement="bottomRight"
      @select="handleFormatChange"
      :class="`${prefixCls}-format-select`"
      size="small"
      :options="selectOptions"
    />
    <div :class="colorInputPrefixCls">
      <ColorHsbInput v-if="colorFormat === FORMAT_HSB" v-bind="inputProps" />
      <ColorRgbInput v-else-if="colorFormat === FORMAT_RGB" v-bind="inputProps" />
      <ColorHexInput v-else v-bind="inputProps" />
    </div>
    <ColorAlphaInput v-if="!disabledAlpha" :prefix-cls="prefixCls" :value="value" @change="onChange" />
  </div>
</template>
