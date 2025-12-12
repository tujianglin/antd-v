<script lang="tsx" setup>
import type { InputRef, ValueType } from '@/vc-component/input/interface';
import clsx from 'clsx';
import { computed, getCurrentInstance, ref, toRefs, useAttrs } from 'vue';
import { useConfigContextInject } from '../../../components/config-provider';
import raf from '../../../vc-util/raf';
import Input, { type InputProps } from '../Input.vue';

export interface OTPInputProps extends Omit<InputProps, 'onChange'> {
  index: number;
  mask?: boolean | string;
}

defineOptions({ name: 'OTPInput', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, index, mask, ...restProps } = defineProps<OTPInputProps>();

const emits = defineEmits<{
  change: [number, string];
  activeChange: [number];
  focus: [FocusEvent];
}>();

const attrs = useAttrs();

const value = defineModel<ValueType>('value');

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = getPrefixCls.value('otp');
const maskValue = computed(() => (typeof mask === 'string' ? mask : value.value));

const inputRef = ref<InputRef>(null);
function onInternalChange(e) {
  emits('change', index, e.target.value);
}

function syncSelection() {
  raf(() => {
    const inputEle = inputRef.value?.input;
    if (document.activeElement === inputEle && inputEle) {
      inputEle.select();
    }
  });
}

const onInternalFocus = (e: FocusEvent) => {
  emits('focus', e);
  syncSelection();
};

// ======================== Keyboard ========================
function onInternalKeyDown(event) {
  const { key, ctrlKey, metaKey } = event;
  if (key === 'ArrowLeft') {
    emits('activeChange', index - 1);
  } else if (key === 'ArrowRight') {
    emits('activeChange', index + 1);
  } else if (key === 'z' && (ctrlKey || metaKey)) {
    event.preventDefault();
  } else if (key === 'Backspace' && !value.value) {
    emits('activeChange', index - 1);
  }

  syncSelection();
}

const vm = getCurrentInstance();
function changeRef(el) {
  inputRef.value = el;
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
}
</script>
<template>
  <span :class="`${prefixCls}-input-wrapper`" role="presentation">
    <template v-if="mask && value !== '' && value !== undefined">
      <span :class="`${prefixCls}-mask-icon`" aria-hidden="true">
        {{ maskValue }}
      </span>
    </template>
    <Input
      :aria-label="`OTP Input ${index + 1}`"
      :type="mask === true ? 'password' : 'text'"
      :ref="changeRef"
      v-bind="{ ...restProps, ...attrs }"
      v-model:value="value"
      @input="onInternalChange"
      @focus="onInternalFocus"
      @keydown="onInternalKeyDown"
      @mousedown="syncSelection"
      @mouseup="syncSelection"
      :class="
        clsx(className, {
          [`${prefixCls}-mask-input`]: mask,
        })
      "
    />
  </span>
</template>
