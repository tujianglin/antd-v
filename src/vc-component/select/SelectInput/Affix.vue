<script lang="tsx" setup>
import type { HTMLAttributes } from 'vue';

export interface AffixProps extends /** @vue-ignore */ HTMLAttributes {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<AffixProps>();
</script>
<template>
  <div v-bind="{ ...$props, ...$attrs }">
    <slot></slot>
  </div>
</template>
