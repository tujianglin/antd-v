<script lang="tsx" setup>
import raf from '@/vc-util/raf';
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue';
import type { TooltipProps } from '../tooltip';
import Tooltip from '../tooltip';

export type SliderTooltipProps = TooltipProps & {
  draggingDelete?: boolean;
  value?: number;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { draggingDelete, value, title } = defineProps<SliderTooltipProps>();

const open = defineModel('open', { default: false });

const innerRef = useTemplateRef('innerRef');

const mergedOpen = computed(() => open.value && !draggingDelete);

const rafRef = ref<number | null>(null);

function cancelKeepAlign() {
  raf.cancel(rafRef.value!);
  rafRef.value = null;
}

function keepAlign() {
  rafRef.value = raf(() => {
    innerRef.value?.forceAlign();
    rafRef.value = null;
  });
}

watch(
  [mergedOpen, () => title, () => value],
  () => {
    if (mergedOpen.value) {
      keepAlign();
    } else {
      cancelKeepAlign();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  cancelKeepAlign();
});
</script>
<template>
  <Tooltip ref="innerRef" v-bind="$props" :open="mergedOpen">
    <template #title> {{ title }} </template>
    <slot></slot>
  </Tooltip>
</template>
