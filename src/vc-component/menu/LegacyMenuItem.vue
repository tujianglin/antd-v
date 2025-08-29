<script lang="tsx" setup>
import Overflow from '@/vc-component/overflow';
import type { RawItemProps } from '@/vc-component/overflow/RawItem.vue';
import { composeRef } from '@/vc-util/ref';
import { omit } from 'lodash-es';
import { ref, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = defineProps<RawItemProps>();

const attrs = useAttrs() as any;

const domRef = ref();

defineExpose({
  get el() {
    return domRef.value || {};
  },
});
</script>
<template>
  <Overflow.Item
    :ref="composeRef((el) => (domRef = el?.el))"
    v-bind="{
      ...props,
      ...attrs,
      ...omit(attrs, ['eventKey', 'popupClassName', 'popupOffset', 'onTitleClick', 'title']),
    }"
    :title="typeof attrs?.title === 'string' ? attrs?.title : undefined"
  >
    <slot></slot>
  </Overflow.Item>
</template>
