<script lang="tsx" setup>
import type { DefaultOptionType } from './interface';

export interface OptionGroupFC extends Omit<DefaultOptionType, 'options'> {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 }, isSelectOptGroup: true });

withDefaults(defineProps<OptionGroupFC>(), {});
</script>
<template><slot></slot></template>
