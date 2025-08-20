<script lang="tsx" setup>
import { ref } from 'vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<{ x: number; y: number }>();
const domRef = ref(null);

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <div
    ref="domRef"
    :style="{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      zIndex: 1,
      transform: 'translate(-50%, -50%)',
    }"
  >
    <slot></slot>
  </div>
</template>
