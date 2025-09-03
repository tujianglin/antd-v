<script lang="tsx" setup>
import { ref, useTemplateRef } from 'vue';
import { BaseInput } from '../input';
import type { HolderRef } from '../input/BaseInput.vue';
import { triggerFocus, type InputFocusOptions } from '../input/utils/commonUtils';
import type { ValueType } from '../mini-decimal';
import type { InputNumberProps } from './interface';
import InternalInputNumber from './InternalInputNumber.vue';
import { SemanticContextProvider } from './SemanticContext';

defineOptions({ inheritAttrs: false });

const {
  disabled,
  style,
  prefixCls = 'rc-input-number',
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  class: className,
  classNames,
  styles,
  ...rest
} = defineProps<InputNumberProps>();
const value = defineModel<ValueType>('value');

const holderRef = ref<HolderRef>(null);
const inputFocusRef = useTemplateRef('InternalInputNumberRef');

const focus = (option?: InputFocusOptions) => {
  if (inputFocusRef.value?.input) {
    triggerFocus(inputFocusRef.value?.input, option);
  }
};

defineExpose({
  focus,
  blur: () => inputFocusRef.value?.input?.blur?.(),
  get nativeElement() {
    return holderRef.value.nativeElement || inputFocusRef.value?.domRef;
  },
});
</script>
<template>
  <SemanticContextProvider :value="{ classNames, styles }">
    <BaseInput
      :class="className"
      :trigger-focus="focus"
      :prefix-cls="prefixCls"
      v-model:value="value"
      :disabled="disabled"
      :style="style"
      :prefix="prefix"
      :suffix="suffix"
      :addon-after="addonAfter"
      :addon-before="addonBefore"
      :class-names="classNames"
      :styles="styles"
      :components="{
        affixWrapper: 'div',
        groupWrapper: 'div',
        wrapper: 'div',
        groupAddon: 'div',
      }"
      ref="holderRef"
    >
      <InternalInputNumber
        v-bind="{ ...rest, ...$attrs }"
        v-model:value="value"
        :prefix-cls="prefixCls"
        :disabled="disabled"
        ref="InternalInputNumberRef"
        :class="classNames?.input"
        :style="styles.input"
      />
    </BaseInput>
  </SemanticContextProvider>
</template>
