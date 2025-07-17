<script lang="tsx" setup>
import { useGroupContextProvider, type GroupContextProps } from './context';

const props = defineProps<{ value: GroupContextProps }>();

useGroupContextProvider(props.value);
</script>
<template>
  <slot></slot>
</template>
