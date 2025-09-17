<script lang="tsx" setup>
import {} from 'vue';
import type { ButtonProps } from '../button';
import Button from '../button';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<ButtonProps>();
</script>
<template>
  <Button v-bind="$props" size="small" type="primary"><slot></slot></Button>
</template>
