<script lang="tsx" setup>
import { Render } from '@/components';
import {} from 'vue';
import type { TourStepInfo, TourStepProps } from '../interface';
import DefaultPanel, { type DefaultPanelProps } from './DefaultPanel.vue';

export type { TourStepInfo, TourStepProps };

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { current, renderPanel } = defineProps<DefaultPanelProps>();
</script>
<template>
  <template v-if="typeof renderPanel === 'function'">
    <Render :content="renderPanel($props, current)" />
  </template>
  <DefaultPanel v-else v-bind="$props" />
</template>
