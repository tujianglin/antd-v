<script lang="tsx" setup>
import { useDesignTokenContextProvider, type DesignTokenProviderProps } from './context';
defineOptions({ name: 'DesignTokenProvider' });

const props = defineProps<{ value: DesignTokenProviderProps }>();

useDesignTokenContextProvider(props.value);
</script>
<template>
  <slot></slot>
</template>
