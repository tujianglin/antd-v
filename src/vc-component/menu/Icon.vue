<script lang="tsx" setup>
import { createVNode, useSlots } from 'vue';
import type { RenderIconInfo, RenderIconType } from './interface';

export interface IconProps {
  icon?: RenderIconType;
  props: RenderIconInfo;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { icon, props } = defineProps<IconProps>();

const slots = useSlots();

const IconNode = () => {
  let result;

  if (typeof icon === 'function') {
    result = createVNode(icon as any, {
      ...props,
    });
  } else if (typeof icon !== 'boolean') {
    // Compatible for origin definition
    result = icon;
  }
  return result || slots?.default?.();
};
</script>
<template>
  <template v-if="icon === null || icon === false"> </template>
  <IconNode />
</template>
