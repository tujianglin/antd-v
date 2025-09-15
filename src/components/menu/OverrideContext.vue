<script lang="tsx" setup>
import { computed } from 'vue';
import ContextIsolator from '../_util/ContextIsolator';
import { OverrideContextProvider, useOverrideContextInject, type OverrideContextProps } from './MenuContext';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const restProps = defineProps<OverrideContextProps>();
const override = useOverrideContextInject();
const context = computed<OverrideContextProps>(() => ({ ...override, ...restProps }));
</script>
<template>
  <OverrideContextProvider :value="context">
    <ContextIsolator space> <slot></slot> </ContextIsolator>
  </OverrideContextProvider>
</template>
