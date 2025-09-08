<script lang="tsx" setup>
import type { IconProps } from './Icon.vue';
import Icon from './Icon.vue';

export interface ClearIconProps extends Omit<IconProps, 'type'> {
  onClear: VoidFunction;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { onClear, ...restProps } = defineProps<ClearIconProps>();
</script>
<template>
  <Icon
    v-bind="{ ...restProps, ...$attrs }"
    type="clear"
    role="button"
    @mousedown="(e) => e.preventDefault()"
    @click="
      (e) => {
        e.stopPropagation();
        onClear();
      }
    "
  />
</template>
