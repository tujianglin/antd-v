<script lang="tsx" setup>
import Overflow from '@/vc-component/overflow';
import type { RawItemProps } from '@/vc-component/overflow/RawItem.vue';
import { omit } from 'es-toolkit/compat';
import { useTemplateRef } from 'vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = defineProps<RawItemProps>();

const { Item } = Overflow;

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value?.el;
  },
});
</script>
<template>
  <Item
    ref="domRef"
    v-bind="{
      ...props,
      ...omit($attrs, ['eventKey', 'popupClassName', 'popupOffset', 'onTitleClick', 'title']),
    }"
    :title="typeof $attrs?.title === 'string' ? $attrs?.title : undefined"
  >
    <slot></slot>
  </Item>
</template>
