<script lang="tsx" setup>
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, toRefs } from 'vue';
import { CONTAINER_MAX_OFFSET } from '../_util/hooks/useZIndex';
import { getTransitionName } from '../_util/motion';
import type { ThemeConfig } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import useToken from '../theme/useToken';
import ConfirmContent from './ConfirmContent.vue';
import type { ModalFuncProps, ModalLocale } from './interface';
import Modal from './Modal.vue';

export interface ConfirmDialogProps extends ModalFuncProps {
  prefixCls: string;
  afterClose?: () => void;
  close?: (...args: any[]) => void;
  /**
   * `close` prop support `...args` that pass to the developer
   * that we can not break this.
   * Provider `onClose` for internal usage
   */
  onConfirm?: (confirmed: boolean) => void;
  autoFocusButton?: null | 'ok' | 'cancel';
  rootPrefixCls?: string;
  iconPrefixCls?: string;

  /**
   * Only passed by static method
   */
  theme?: ThemeConfig;

  /** @private Internal Usage. Do not override this */
  locale?: ModalLocale;

  /**
   * Do not throw if is await mode
   */
  isSilent?: () => boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  close,
  zIndex,
  maskStyle,
  direction,
  prefixCls,
  wrapClassName,
  rootPrefixCls,
  bodyStyle,
  closable = false,
  onConfirm,
  styles,
  okButtonProps,
  cancelButtonProps,
  width = 416,
  style = {},
  ...resetProps
} = defineProps<ConfirmDialogProps>();

const { cancelButtonProps: contextCancelButtonProps, okButtonProps: contextOkButtonProps } = toRefs(useComponentConfig('modal'));

const confirmPrefixCls = computed(() => `${prefixCls}-confirm`);

// 默认为 false，保持旧版默认行为
const maskClosable = computed(() => (resetProps.maskClosable === undefined ? false : resetProps.maskClosable));

const classString = computed(() =>
  clsx(
    confirmPrefixCls.value,
    `${confirmPrefixCls.value}-${resetProps.type}`,
    { [`${confirmPrefixCls.value}-rtl`]: direction === 'rtl' },
    resetProps.class,
  ),
);

// ========================= zIndex =========================
const [, token] = useToken();

const mergedZIndex = computed(() => {
  if (zIndex !== undefined) {
    return zIndex;
  }

  // Static always use max zIndex
  return token?.value?.zIndexPopupBase + CONTAINER_MAX_OFFSET;
});
</script>
<template>
  <Modal
    v-bind="omit($props, ['onCancel', 'onConfirm'])"
    :class="classString"
    :wrap-class-name="clsx({ [`${confirmPrefixCls}-centered`]: !!centered }, wrapClassName)"
    @cancel="
      () => {
        close?.({ triggerCancel: true });
        onConfirm?.(false);
      }
    "
    title=""
    :footer="null"
    :transition-name="getTransitionName(rootPrefixCls || '', 'zoom', transitionName)"
    :mask-transition-name="getTransitionName(rootPrefixCls || '', 'fade', maskTransitionName)"
    :mask-closable="maskClosable"
    :style="style"
    :styles="{ body: bodyStyle, mask: maskStyle, ...styles }"
    :width="width"
    :z-index="mergedZIndex"
    :closable="closable"
  >
    <ConfirmContent
      v-bind="$props"
      :confirm-prefix-cls="confirmPrefixCls"
      :ok-button-props="{ ...contextOkButtonProps, ...okButtonProps }"
      :cancel-button-props="{ ...contextCancelButtonProps, ...cancelButtonProps }"
    />
  </Modal>
</template>
