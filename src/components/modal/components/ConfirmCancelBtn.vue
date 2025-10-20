<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { toRefs } from 'vue';
import ActionButton from '../../_util/ActionButton.vue';
import type { ConfirmDialogProps } from '../ConfirmDialog.vue';
import { useModalContextInject } from '../context';

export interface ConfirmCancelBtnProps
  extends Pick<ConfirmDialogProps, 'cancelButtonProps' | 'isSilent' | 'rootPrefixCls' | 'close' | 'onConfirm' | 'onCancel'> {
  autoFocusButton?: false | 'ok' | 'cancel' | null;
  cancelTextLocale?: VueNode;
  mergedOkCancel?: boolean;
  onClose?: () => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  autoFocusButton,
  cancelButtonProps,
  cancelTextLocale,
  isSilent,
  mergedOkCancel,
  rootPrefixCls,
  close,
  onCancel,
  onConfirm,
  onClose,
} = toRefs(useModalContextInject());
</script>
<template>
  <ActionButton
    v-if="mergedOkCancel"
    :is-silent="isSilent"
    :action-fn="onCancel"
    :close="(...args: any[]) => {
      close?.(...args);
      onConfirm?.(false);
      onClose?.();
    }"
    :auto-focus="autoFocusButton === 'cancel'"
    :button-props="cancelButtonProps"
    :prefix-cls="`${rootPrefixCls}-btn`"
  >
    <Render :content="cancelTextLocale" />
  </ActionButton>
</template>
