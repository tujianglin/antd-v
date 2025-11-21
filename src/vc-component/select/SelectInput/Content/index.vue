<script lang="tsx" setup>
import pickAttrs from '@/vc-util/pickAttrs';
import { computed, getCurrentInstance, toRefs, type InputHTMLAttributes } from 'vue';
import { useBaseSelectContextInject } from '../../hooks/useBaseProps';
import { useSelectInputContextInject } from '../context';
import MultipleContent from './MultipleContent.vue';
import SingleContent from './SingleContent.vue';

export interface SharedContentProps {
  inputProps: InputHTMLAttributes;
}

const { multiple, onInputKeyDown, tabindex } = toRefs(useSelectInputContextInject());
const baseProps = useBaseSelectContextInject();
const showSearch = computed(() => baseProps.showSearch);

const ariaProps = computed(() => pickAttrs(baseProps, { aria: true }));

const sharedInputProps = computed<SharedContentProps['inputProps']>(() => ({
  ...ariaProps.value,
  onKeydown: onInputKeyDown?.value,
  readonly: !showSearch.value,
  tabindex: tabindex?.value,
}));

const vm = getCurrentInstance();

const changeRef = (el) => {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
};
</script>
<template>
  <MultipleContent v-if="multiple" :ref="changeRef" :input-props="sharedInputProps" />
  <SingleContent v-else :ref="changeRef" :input-props="sharedInputProps" />
</template>
