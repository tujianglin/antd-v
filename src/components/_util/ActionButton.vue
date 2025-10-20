<script lang="tsx" setup>
import { onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue';
import Button from '../button';
import { convertLegacyProps } from '../button/buttonHelpers';
import type { ButtonProps, LegacyButtonType } from '../button/interface';

export interface ActionButtonProps {
  type?: LegacyButtonType;
  actionFn?: (...args: any[]) => any | PromiseLike<any>;
  close?: (...args: any[]) => void;
  autoFocus?: boolean;
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

const { type, prefixCls, buttonProps, close, autoFocus, emitEvent, isSilent, quitOnNullishReturnValue, actionFn } =
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
  if (autoFocus) {
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
  if (!isThenable(returnValueOfOnOk)) {
    return;
  }
  loading.value = true;
  returnValueOfOnOk.then(
    (...args: any[]) => {
      loading.value = false;
      onInternalClose(...args);
      clickedRef.value = false;
    },
    (e: Error) => {
      // See: https://github.com/ant-design/ant-design/issues/6183
      loading.value = false;
      clickedRef.value = false;

      // Do not throw if is `await` mode
      if (isSilent?.()) {
        return;
      }

      return Promise.reject(e);
    },
  );
};

const onClick = async (e: MouseEvent) => {
  if (clickedRef.value) return;
  clickedRef.value = true;

  if (!actionFn) {
    onInternalClose();
    return;
  }

  loading.value = true;
  let returnValueOfOnOk: any;

  try {
    // 执行 actionFn
    if (emitEvent) {
      returnValueOfOnOk = await actionFn(e);
    } else if (actionFn.length) {
      returnValueOfOnOk = await actionFn(close);
    } else {
      returnValueOfOnOk = await actionFn();
    }

    // ✅ 即使没有返回 Promise，也等待函数执行完毕再决定是否关闭
    if (quitOnNullishReturnValue && !isThenable(returnValueOfOnOk)) {
      onInternalClose(e);
      loading.value = false;
      clickedRef.value = false;
      return;
    }

    // ✅ 如果返回的是 Promise，则等待它完成
    await handlePromiseOnOk(returnValueOfOnOk);

    // ✅ 如果不是 Promise，但执行完了，也关闭
    if (!isThenable(returnValueOfOnOk)) {
      onInternalClose();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
    clickedRef.value = false;
  }
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
