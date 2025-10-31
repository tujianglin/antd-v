<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue';
import Button, { type ButtonProps } from '../button';
import { convertLegacyProps } from '../button/buttonHelpers';
import type { LegacyButtonType } from '../button/interface';

export interface ActionButtonProps {
  type?: LegacyButtonType;
  actionFn?: (...args: any[]) => any | PromiseLike<any>;
  close?: (...args: any[]) => void;
  autofocus?: boolean;
  prefixCls: string;
  buttonProps?: ButtonProps;
  emitEvent?: boolean;
  quitOnNullishReturnValue?: boolean;

  /**
   * Do not throw if is await mode
   */
  isSilent?: () => boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { type, prefixCls, buttonProps, close, autofocus, emitEvent, isSilent, quitOnNullishReturnValue, actionFn } =
  defineProps<ActionButtonProps>();

const isThenable = <T,>(thing?: PromiseLike<T>): thing is PromiseLike<T> => {
  return typeof thing?.then === 'function';
};

const clickedRef = shallowRef<boolean>(false);
const buttonRef = useTemplateRef<HTMLButtonElement>('buttonRef');
const loading = ref<ButtonProps['loading']>(false);

const onInternalClose = (...args: any[]) => {
  close?.(...args);
};

let timeoutId: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  if (autofocus) {
    timeoutId = setTimeout(() => {
      buttonRef.value?.focus({ preventScroll: true });
    });
  }
});

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});

const handlePromiseOnOk = (returnValueOfOnOk?: PromiseLike<any>) => {
  if (!isThenable(returnValueOfOnOk)) return;

  loading.value = true;
  returnValueOfOnOk.then(
    (...args: any[]) => {
      loading.value = false;
      onInternalClose(...args);
      clickedRef.value = false;
    },
    (e: Error) => {
      loading.value = false;
      clickedRef.value = false;
      if (isSilent?.()) return;
      return Promise.reject(e);
    },
  );
};

const onClick = (e: MouseEvent) => {
  if (clickedRef.value) return;
  clickedRef.value = true;

  if (!actionFn) {
    onInternalClose();
    return;
  }

  let returnValueOfOnOk: PromiseLike<any> | undefined;

  if (emitEvent) {
    returnValueOfOnOk = actionFn(e);
    if (quitOnNullishReturnValue && !isThenable(returnValueOfOnOk)) {
      clickedRef.value = false;
      onInternalClose(e);
      return;
    }
  } else if (actionFn.length) {
    returnValueOfOnOk = actionFn(close);
    clickedRef.value = false;
  } else {
    returnValueOfOnOk = actionFn();
    if (!isThenable(returnValueOfOnOk)) {
      onInternalClose();
      return;
    }
  }

  handlePromiseOnOk(returnValueOfOnOk);
};
</script>

<template>
  <Button
    ref="buttonRef"
    v-bind="{ ...convertLegacyProps(type), ...buttonProps }"
    @click="onClick"
    :loading="loading"
    :prefix-cls="prefixCls"
  >
    <component :is="$slots?.default" />
  </Button>
</template>
