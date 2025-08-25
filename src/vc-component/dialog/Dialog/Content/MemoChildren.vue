<script setup lang="ts">
import { defineProps, shallowRef, watchEffect } from 'vue';

interface PopupContentProps {
  shouldUpdate?: boolean;
}

const props = defineProps<PopupContentProps>();

// 用来缓存上一次渲染的内容
const cachedVNode = shallowRef();

watchEffect(() => {
  if (!props.shouldUpdate) {
    // 不缓存时，重新渲染
    cachedVNode.value = undefined;
  }
});
</script>

<template>
  <!-- 如果有缓存并启用缓存，则使用缓存，否则更新 -->
  <slot v-if="!props.shouldUpdate || !cachedVNode" v-bind="{ ref: (el) => (cachedVNode = el) }"></slot>
  <template v-else>
    <!-- 渲染缓存的 vnode -->
    <component :is="cachedVNode" />
  </template>
</template>
