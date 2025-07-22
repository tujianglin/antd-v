<script setup lang="ts">
import { shallowRef, watchEffect } from 'vue';

defineOptions({ name: 'PopupContent' });

const props = defineProps<{
  cache?: boolean;
}>();

const slotContent = shallowRef();

// 自动跟踪 slot 内容并决定是否缓存
watchEffect(() => {
  if (!props.cache) {
    slotContent.value = undefined;
  }
});
</script>

<template>
  <template v-if="cache">
    <slot></slot>
  </template>
  <template v-else>
    <!-- Don't reuse cached content -->
    <slot :key="Math.random()"></slot>
  </template>
</template>
