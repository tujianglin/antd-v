<script lang="tsx" setup>
import type { InputRef } from '@/vc-component/input/interface';
import clsx from 'clsx';
import { computed, getCurrentInstance, ref, toRefs, useAttrs } from 'vue';
import { useConfigContextInject } from '../../../components/config-provider';
import raf from '../../../vc-util/raf';
import Input from '../index.vue';
import type { InputProps } from '../interface';

export interface OTPInputProps extends Omit<InputProps, 'onChange'> {
  index: number;
  onChange: (index: number, value: string) => void;
  /** Tell parent to do active offset */
  onActiveChange: (nextIndex: number) => void;

  mask?: boolean | string;
}

const { class: className, onChange, onActiveChange, index, mask, ...restProps } = defineProps<OTPInputProps>();
const attrs = useAttrs();

const value = defineModel<string>('value');

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = getPrefixCls.value('otp');
const maskValue = computed(() => (typeof mask === 'string' ? mask : value.value));

const inputRef = ref<InputRef>(null);
function onInternalChange(e) {
  onChange(index, e.target.value);
}

function syncSelection() {
  raf(() => {
    const inputEle = inputRef.value?.input();
    if (document.activeElement === inputEle && inputEle) {
      inputEle.select();
    }
  });
}

// ======================== Keyboard ========================
function onInternalKeyDown(event) {
  const { key, ctrlKey, metaKey } = event;
  if (key === 'ArrowLeft') {
    onActiveChange(index - 1);
  } else if (key === 'ArrowRight') {
    onActiveChange(index + 1);
  } else if (key === 'z' && (ctrlKey || metaKey)) {
    event.preventDefault();
  }
  syncSelection();
}

function onInternalKeyUp(e) {
  if (e.key === 'Backspace' && !value.value) {
    onActiveChange(index - 1);
  }
  syncSelection();
}

const wm = getCurrentInstance();
function changeRef(instance) {
  inputRef.value = instance;
  wm.exposed = instance || {};
  wm.exposeProxy = instance || {};
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
      @focus="syncSelection"
      @keydown="onInternalKeyDown"
      @keyup="onInternalKeyUp"
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
