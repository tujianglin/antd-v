<script lang="tsx" setup>
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import { supportNodeRef } from '@/vc-util/ref';
import { cloneVNode, computed, ref } from 'vue';
import type { MutationObserverProps } from './interface';
import useMutateObserver from './useMutateObserver';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { options, onMutate = () => {} } = defineProps<MutationObserverProps>();

const callback = computed(() => onMutate);

const target = ref(null);

useMutateObserver(
  target,
  callback,
  computed(() => options),
);
</script>
<template>
  <template v-if="supportNodeRef(flattenChildren($slots.default?.())[0])">
    <component :is="cloneVNode(flattenChildren($slots.default?.())[0], { ref: (el) => (target = el) })" />
  </template>
  <template v-else> <slot></slot> </template>
</template>
