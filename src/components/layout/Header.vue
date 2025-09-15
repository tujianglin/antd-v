<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import type { BasicProps } from './Layout.vue';
import useStyle from './style';

defineOptions({ name: 'Header', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls: customizePrefixCls, suffixCls = 'header', class: className, ...others } = defineProps<BasicProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('layout', customizePrefixCls));

const [hashId] = useStyle(prefixCls);

const prefixWithSuffixCls = computed(() => (suffixCls ? `${prefixCls.value}-${suffixCls}` : prefixCls.value));
</script>
<template>
  <header :class="clsx(customizePrefixCls || prefixWithSuffixCls, className, hashId)" v-bind="{ ...others, ...$attrs }">
    <slot></slot>
  </header>
</template>
