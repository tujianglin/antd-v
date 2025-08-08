<script lang="tsx" setup>
import { SpaceCompactItemContextProvider, type SpaceCompactItemContextType } from './CompactContext';

defineOptions({ inheritAttrs: false });

const props = defineProps<SpaceCompactItemContextType>();
</script>
<template>
  <SpaceCompactItemContextProvider :value="props">
    <slot></slot>
  </SpaceCompactItemContextProvider>
</template>
