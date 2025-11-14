<script lang="tsx" setup>
import { isArray } from 'es-toolkit/compat';
import { toRefs } from 'vue';
import type { AggregationColor } from '../color';
import { usePanelPresetsContextInject } from '../context';
import type { PresetsItem } from '../interface';
import ColorPresets from './ColorPresets.vue';

const { prefixCls, value, presets, onChange } = toRefs(usePanelPresetsContextInject());
</script>
<template>
  <ColorPresets
    v-if="isArray(presets)"
    :value="value as AggregationColor"
    :presets="presets as PresetsItem[]"
    :prefix-cls="prefixCls"
    @change="onChange"
  />
</template>
