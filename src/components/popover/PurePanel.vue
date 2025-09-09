<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useConfigContextInject } from '../config-provider';
import type { PopoverProps } from './index.vue';
import RawPurePanel from './RawPurePanel.vue';
import useStyle from './style';

export interface PurePanelProps extends PopoverProps {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls: customizePrefixCls, class: className, ...restProps } = defineProps<PurePanelProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('popover', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);
</script>
<template>
  <RawPurePanel v-bind="restProps" :prefix-cls="prefixCls" :hash-id="hashId" :class="clsx(className, cssVarCls)">
    <slot></slot>
  </RawPurePanel>
</template>
