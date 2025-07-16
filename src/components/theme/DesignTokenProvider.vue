<script lang="tsx" setup>
import { computed } from 'vue';
import { useDesignTokenContextProvider, type DesignTokenProviderProps } from './context';
defineOptions({ name: 'DesignTokenProvider' });

const props = defineProps<{ value: DesignTokenProviderProps }>();

useDesignTokenContextProvider(computed(() => props.value));
</script>
<template>
  <slot></slot>
</template>
