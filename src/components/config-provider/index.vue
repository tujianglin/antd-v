<script lang="tsx" setup>
import {} from 'vue';
import { useLocaleContextInject } from '../locale/context';
import ProviderChildren from './ProviderChildren.vue';
import { useConfigContextInject } from './context';
import type { ConfigProviderProps } from './interface';

defineOptions({ name: 'VConfigProvider', inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<ConfigProviderProps>();

const context = useConfigContextInject();
const antLocale = useLocaleContextInject();
</script>
<template>
  <ProviderChildren :parent-context="context" :legacy-locale="antLocale!" v-bind="$props"><slot></slot></ProviderChildren>
</template>
