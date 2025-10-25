<script lang="tsx" setup>
import type { TooltipProps } from '../../tooltip';
import Tooltip from '../../tooltip';

export interface EllipsisTooltipProps {
  tooltipProps?: TooltipProps;
  enableEllipsis: boolean;
  isEllipsis?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { enableEllipsis, isEllipsis, tooltipProps } = defineProps<EllipsisTooltipProps>();
</script>
<template>
  <slot v-if="!tooltipProps?.title || !enableEllipsis"></slot>
  <Tooltip v-else :open="isEllipsis ? undefined : false" v-bind="tooltipProps">
    <slot></slot>
  </Tooltip>
</template>
