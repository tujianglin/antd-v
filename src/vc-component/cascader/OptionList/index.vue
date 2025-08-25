<script lang="tsx" setup>
import { useComposeRef } from '@/components/_util/type';
import { useBaseSelectContextInject } from '@/vc-component/select';
import type { BaseSelectContextProps } from '@/vc-component/select/hooks/useBaseProps';
import RawOptionList from './List.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const baseProps = useBaseSelectContextInject() as BaseSelectContextProps;

const mergedRef = useComposeRef();
</script>
<template>
  <RawOptionList v-bind="{ ...$attrs, ...baseProps }" :ref="mergedRef" />
</template>
