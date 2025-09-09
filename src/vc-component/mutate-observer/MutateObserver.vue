<script lang="tsx" setup>
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import { supportNodeRef } from '@/vc-util/ref';
import { cloneVNode, computed, ref, useSlots } from 'vue';
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

const slots = useSlots();

const children = computed(() => flattenChildren(slots.default?.())[0]);
</script>
<template>
  <template v-if="supportNodeRef(children)">
    <component :is="cloneVNode(children, { ref: (el) => (target = el) })" />
  </template>
  <template v-else> <slot></slot> </template>
</template>
