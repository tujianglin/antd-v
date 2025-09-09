<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs } from 'vue';
import type { AbstractCheckboxProps } from '../checkbox/interface';
import { useConfigContextInject } from '../config-provider';
import { RadioOptionTypeContextProvider } from './context';
import Radio from './index.vue';
import type { RadioChangeEvent } from './interface';

export type RadioButtonProps = AbstractCheckboxProps<RadioChangeEvent>;

defineOptions({ name: 'RadioButton', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls: customizePrefixCls, ...radioProps } = defineProps<RadioButtonProps>();

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('radio', customizePrefixCls));

const vm = getCurrentInstance();

function changeRef(el) {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
}
</script>
<template>
  <RadioOptionTypeContextProvider value="button">
    <Radio :prefix-cls="prefixCls" v-bind="radioProps" type="radio" :ref="changeRef">
      <slot></slot>
    </Radio>
  </RadioOptionTypeContextProvider>
</template>
