<script lang="tsx" setup>
import { useConfigContextInject } from '@/components/config-provider';
import { assign } from 'es-toolkit/compat';
import { computed, ref, toRefs, watchEffect } from 'vue';
import defaultLocale from '../../locale/en_US';
import useLocale from '../../locale/useLocale';
import type { ConfigUpdate } from '../confirm';
import ConfirmDialog from '../ConfirmDialogWrapper.vue';
import type { ModalFuncProps } from '../interface';

export interface HookModalProps {
  afterClose: () => void;
  config: ModalFuncProps;
  onConfirm?: (confirmed: boolean) => void;
  /**
   * Do not throw if is await mode
   */
  isSilent?: () => boolean;
}

export interface HookModalRef {
  destroy: () => void;
  update: (config: ConfigUpdate) => void;
}

const { afterClose: hookAfterClose, config, ...restProps } = defineProps<HookModalProps>();

const open = ref(true);
const innerConfig = ref();

watchEffect(() => {
  innerConfig.value = assign(
    {
      focusTriggerAfterClose: true,
      mask: true,
      keyboard: true,
      maskClosable: true,
      okCancel: undefined,
    },
    config,
  );
});
const { direction, getPrefixCls } = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('modal'));
const rootPrefixCls = computed(() => getPrefixCls.value());

const afterClose = () => {
  hookAfterClose();
  innerConfig.value.afterClose?.();
};

const close = (...args: any[]) => {
  open.value = false;
  const triggerCancel = args.some((param) => param?.triggerCancel);
  if (triggerCancel) {
    innerConfig.value.onCancel?.(() => {}, ...args.slice(1));
  }
};

defineExpose({
  destroy: close,
  update: (newConfig) => {
    const nextConfig = typeof newConfig === 'function' ? newConfig(innerConfig.value) : newConfig;

    innerConfig.value = {
      ...innerConfig.value,
      ...nextConfig,
    };
  },
});

const mergedOkCancel = computed(() => innerConfig?.value?.okCancel ?? innerConfig?.value?.type === 'confirm');

const [contextLocale] = useLocale('Modal', defaultLocale.Modal);
</script>
<template>
  <ConfirmDialog
    v-bind="{ ...innerConfig, ...restProps }"
    :prefix-cls="prefixCls"
    :root-prefix-cls="rootPrefixCls"
    :close="close"
    :open="open"
    :after-close="afterClose"
    :ok-text="innerConfig.okText || (mergedOkCancel ? contextLocale?.okText : contextLocale?.justOkText)"
    :direction="innerConfig.direction || direction"
    :cancel-text="innerConfig.cancelText || contextLocale?.cancelText"
  />
</template>
