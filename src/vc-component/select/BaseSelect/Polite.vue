<script lang="tsx" setup>
import type { DisplayValueType } from '../interface';

export interface PoliteProps {
  visible: boolean;
  values: DisplayValueType[];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<PoliteProps>();

const MAX_COUNT = 50;
</script>
<template>
  <span v-if="visible" aria-live="polite" :style="{ width: 0, height: 0, position: 'absolute', overflow: 'hidden', opacity: 0 }">
    {{
      `${values
        .slice(0, MAX_COUNT)
        .map(({ label, value }) => (['number', 'string'].includes(typeof label) ? label : value))
        .join(', ')}`
    }}
    {{ values.length > MAX_COUNT ? ', ...' : null }}
  </span>
</template>
