<script lang="tsx" setup>
import type { DefaultOptionType } from './interface';

export interface OptionProps extends Omit<DefaultOptionType, 'label'> {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 }, isSelectOption: true });

withDefaults(defineProps<OptionProps>(), {});
</script>
<template><slot></slot></template>
