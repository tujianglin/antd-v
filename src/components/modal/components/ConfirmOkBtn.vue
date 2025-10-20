<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { toRefs } from 'vue';
import ActionButton from '../../_util/ActionButton.vue';
import type { ConfirmDialogProps } from '../ConfirmDialog.vue';
import { useModalContextInject } from '../context';

export interface ConfirmOkBtnProps
  extends Pick<ConfirmDialogProps, 'close' | 'isSilent' | 'okType' | 'okButtonProps' | 'rootPrefixCls' | 'onConfirm' | 'onOk'> {
  autoFocusButton?: false | 'ok' | 'cancel' | null;
  okTextLocale?: VueNode;
  onClose?: () => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { autoFocusButton, close, isSilent, okButtonProps, rootPrefixCls, okTextLocale, okType, onConfirm, onOk, onClose } =
  toRefs(useModalContextInject());
</script>
<template>
  <ActionButton
    :is-silent="isSilent"
    :type="okType || 'primary'"
    :action-fn="onOk"
    :close="(...args: any[]) => {
      close?.(...args);
      onConfirm?.(true);
      onClose?.();
    }"
    :auto-focus="autoFocusButton === 'ok'"
    :button-props="okButtonProps"
    :prefix-cls="`${rootPrefixCls}-btn`"
  >
    <Render :content="okTextLocale" />
  </ActionButton>
</template>
