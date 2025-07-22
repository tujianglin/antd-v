<script lang="tsx" setup>
import { toRefs } from 'vue';
import { useComposeRef } from '../_util/type';
import type { AbstractCheckboxProps } from '../checkbox/interface';
import { useConfigContextInject } from '../config-provider';
import { RadioOptionTypeContextProvider } from './context';
import Radio from './index.vue';
import type { RadioChangeEvent } from './interface';

export type RadioButtonProps = AbstractCheckboxProps<RadioChangeEvent>;

defineOptions({ name: 'RadioButton', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls: customizePrefixCls, ...radioProps } = defineProps<RadioButtonProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = getPrefixCls.value('radio', customizePrefixCls);

const mergeRef = useComposeRef();
</script>
<template>
  <RadioOptionTypeContextProvider value="button">
    <Radio :prefix-cls="prefixCls" v-bind="radioProps" type="radio" :ref="mergeRef">
      <slot></slot>
    </Radio>
  </RadioOptionTypeContextProvider>
</template>
