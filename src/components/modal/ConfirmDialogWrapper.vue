<script lang="tsx" setup>
import ConfigProvider from '../config-provider';
import type { ConfirmDialogProps } from './ConfirmDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const { rootPrefixCls, iconPrefixCls, direction, theme } = defineProps<ConfirmDialogProps>();
</script>
<template>
  <ConfigProvider :prefix-cls="rootPrefixCls" :icon-prefix-cls="iconPrefixCls" :direction="direction" :theme="theme">
    <ConfirmDialog v-bind="$props" />
  </ConfigProvider>
</template>
