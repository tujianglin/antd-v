<script lang="tsx" setup>
import { ref, watch, watchEffect } from 'vue';

interface MockPortalProps {
  open?: boolean;
  autoDestroy?: boolean;
  getContainer?: () => HTMLElement;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { open, autoDestroy, getContainer } = defineProps<MockPortalProps>();

const visible = ref(open);

watchEffect(() => {
  getContainer?.();
});

watch(
  [() => open, () => autoDestroy],
  () => {
    if (open) {
      visible.value = true;
    } else if (autoDestroy) {
      visible.value = false;
    }
  },
  { immediate: true, deep: true },
);
</script>
<template>
  <slot v-if="visible"></slot>
</template>
