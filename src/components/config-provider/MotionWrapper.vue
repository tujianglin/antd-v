<script lang="tsx" setup>
import { MotionProvider } from '@/vc-component/motion';
import { computed, shallowRef, watchEffect } from 'vue';
import { useToken } from '../theme/internal';
import { MotionCacheContextProvider, useMotionCacheContextInject } from './MotionContext';

export interface MotionWrapperProps {}

const parentMotion = useMotionCacheContextInject();

const [, token] = useToken();
const motion = computed(() => token.value.motion);

const needWrapMotionProviderRef = shallowRef(false);
watchEffect(() => {
  needWrapMotionProviderRef.value ||= parentMotion.value !== motion.value;
});
</script>
<template>
  <MotionCacheContextProvider v-if="needWrapMotionProviderRef" :value="motion">
    <MotionProvider :value="{ motion }">
      <slot></slot>
    </MotionProvider>
  </MotionCacheContextProvider>
  <slot v-else></slot>
</template>
