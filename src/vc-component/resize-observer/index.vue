<script lang="tsx" setup>
import { ref } from 'vue';
import { Render } from '../../components';
import type { ResizeObserverProps } from './interface';
import SingleObserver from './SingleObserver/index.vue';

defineOptions({ name: 'ResizeObserver', inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = defineProps<ResizeObserverProps>();

const INTERNAL_PREFIX_KEY = 'rc-observer-key';

const mergedRef = ref();
const changeRef = (ele) => {
  mergedRef.value = ele?.el;
};

defineExpose({
  get el() {
    return mergedRef.value;
  },
});
</script>
<template>
  <SingleObserver
    v-for="(child, index) in $slots.default?.()"
    v-bind="props"
    :key="child?.key || `${INTERNAL_PREFIX_KEY}-${index}`"
    :ref="index === 0 ? changeRef : undefined"
  >
    <Render :content="child" />
  </SingleObserver>
</template>
