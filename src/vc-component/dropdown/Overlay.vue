<script lang="tsx" setup>
import { Render } from '@/components';
import type { DropdownProps } from './Dropdown.vue';
export type OverlayProps = Pick<DropdownProps, 'overlay' | 'arrow' | 'prefixCls'>;

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { overlay, arrow, prefixCls } = defineProps<OverlayProps>();
</script>
<template>
  <div v-if="arrow" :class="`${prefixCls}-arrow`"></div>
  <Render :content="overlay" />
</template>
