<script lang="tsx" setup>
import useClosable, { pickClosable } from '../_util/hooks/useClosable';
import useMergedMask from '../_util/hooks/useMergedMask';
import { useMergeSemantic } from '../_util/hooks';
import { useZIndex } from '../_util/hooks/useZIndex';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import type { ModalClassNamesType, ModalProps, ModalStylesType, MousePosition } from './interface';
import useStyle from './style';
import { canUseDocElement } from '../_util/styleChecker';
import { computed, getCurrentInstance, toRefs, type VNode } from 'vue';
import clsx from 'clsx';
import { CloseOutlined } from '@ant-design/icons-vue';
import { renderCloseIcon } from './util';
import type { Breakpoint } from '../_util/responsiveObserver';
import ContextIsolator from '../_util/ContextIsolator';
import { ZIndexContextProvider } from '../_util/zindexContext';
import Dialog from '@/vc-component/dialog';
import Footer from './shared.vue';
import { getTransitionName } from '../_util/motion';
import { omit } from 'lodash-es';
import type { FooterRender } from './interface';
import Skeleton from '../skeleton';
import { usePanelRef } from '../watermark/context';
defineOptions({ name: 'Modal', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  open,
  wrapClassName,
  centered,
  getContainer,
  focusTriggerAfterClose = true,
  style,
  width = 520,
  footer: footerRender,
  classNames: modalClassNames,
  styles: modalStyles,
  loading,
  confirmLoading,
  zIndex: customizeZIndex,
  mousePosition: customizeMousePosition,
  onOk,
  onCancel,
  okButtonProps,
  cancelButtonProps,
  destroyOnHidden,
  closable,
  mask: modalMask = true,
  keyboard = true,
  maskClosable = true,
  title: titleRender,
  ...restProps
} = defineProps<ModalProps>();

const slots = defineSlots<{
  title: () => VNode[];
  footer: (props: Parameters<FooterRender>[0]) => VNode[];
}>();

const footer = computed(() => slots.footer || footerRender);
const title = computed(() => slots.title || titleRender);

let mousePosition: MousePosition;

// ref: https://github.com/ant-design/ant-design/issues/15795
const getClickPosition = (e: MouseEvent) => {
  mousePosition = {
    x: e.pageX,
    y: e.pageY,
  };
  // 100ms 内发生过点击事件，则从点击位置动画展示
  // 否则直接 zoom 展示
  // 这样可以兼容非点击方式展开
  setTimeout(() => {
    mousePosition = null;
  }, 100);
};

// 只有点击事件支持从鼠标位置动画展开
if (canUseDocElement()) {
  document.documentElement.addEventListener('click', getClickPosition, true);
}

const {
  getPopupContainer: getContextPopupContainer,
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  centered: contextCentered,
  cancelButtonProps: contextCancelButtonProps,
  okButtonProps: contextOkButtonProps,
  mask: contextMask,
} = toRefs(useComponentConfig('modal'));

const { modal: modalContext } = toRefs(useConfigContextInject());

const closeProps = computed(() => {
  if (typeof closable === 'boolean') {
    return [undefined, undefined];
  }
  return [closable?.afterClose, closable?.onClose];
});

const closableAfterclose = computed(() => closeProps.value?.[0]);
const onClose = computed(() => closeProps.value?.[1]);

const prefixCls = computed(() => getPrefixCls.value('modal', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());

const [mergedMask, maskBlurClassName] = useMergedMask(
  computed(() => modalMask),
  contextMask,
  prefixCls,
);

const vm = getCurrentInstance();

// ============================ zIndex ============================
const [zIndex, contextZIndex] = useZIndex(
  'Modal',
  computed(() => customizeZIndex),
);

const [mergedClassNames, mergedStyles] = useMergeSemantic<ModalClassNamesType, ModalStylesType, ModalProps>(
  computed(() => [contextClassNames?.value, modalClassNames, maskBlurClassName?.value]),
  computed(() => [contextStyles?.value, modalStyles]),
  computed(() => ({
    props: {
      ...vm.props,
      width,
      focusTriggerAfterClose,
      mask: mergedMask.value,
      zIndex: zIndex.value,
    },
  })),
);

const handleCancel = (e: MouseEvent) => {
  if (confirmLoading) {
    return;
  }
  onCancel?.(e);
  onClose?.value?.();
};

const handleOk = (e: MouseEvent) => {
  onOk?.(e);
  onClose?.value?.();
};

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const wrapClassNameExtended = computed(() =>
  clsx(wrapClassName, {
    [`${prefixCls.value}-centered`]: centered ?? contextCentered?.value,
    [`${prefixCls.value}-wrap-rtl`]: direction?.value === 'rtl',
  }),
);

const [rawClosable, mergedCloseIcon, closeBtnIsDisabled, ariaProps] = useClosable(
  computed(() => pickClosable(vm.props)),
  computed(() => pickClosable(modalContext?.value as any)),
  computed(() => ({
    closable: true,
    closeIcon: <CloseOutlined class={`${prefixCls.value}-close-icon`} />,
    closeIconRender: (icon) => renderCloseIcon(prefixCls.value, icon),
  })),
);

const mergedClosable = computed<any>(() =>
  rawClosable.value
    ? {
        disabled: closeBtnIsDisabled.value,
        closeIcon: mergedCloseIcon.value,
        afterClose: closableAfterclose.value,
        ...ariaProps.value,
      }
    : false,
);
// ============================ Refs ============================
// Select `ant-modal-container` by `panelRef`
const innerPanelRef = usePanelRef(computed(() => `.${prefixCls.value}-container`));
const mergedPanelRef = (el) => {
  innerPanelRef(el?.panel);
};

// =========================== Width ============================
const widthProps = computed(() => {
  if (width && typeof width === 'object') {
    return [undefined, width];
  }
  return [width, undefined];
});

const numWidth = computed(() => widthProps?.value?.[0] as number);
const responsiveWidth = computed(() => widthProps?.value?.[1]);

const responsiveWidthVars = () => {
  const vars: Record<string, string> = {};
  if (responsiveWidth?.value) {
    Object.keys(responsiveWidth.value).forEach((breakpoint) => {
      const breakpointWidth = responsiveWidth.value[breakpoint as Breakpoint];
      if (breakpointWidth !== undefined) {
        vars[`--${prefixCls.value}-${breakpoint}-width`] =
          typeof breakpointWidth === 'number' ? `${breakpointWidth}px` : breakpointWidth;
      }
    });
  }
  return vars;
};

const dialogFooter = () => {
  return footer.value !== null && !loading ? (
    <Footer
      {...omit(vm.props, ['onOk', 'onCancel'])}
      footer={footer.value}
      okButtonProps={{ ...contextOkButtonProps?.value, ...okButtonProps }}
      onOk={handleOk}
      cancelButtonProps={{ ...contextCancelButtonProps?.value, ...cancelButtonProps }}
      onCancel={handleCancel}
    />
  ) : null;
};
</script>
<template>
  <ContextIsolator form space>
    <ZIndexContextProvider :value="contextZIndex">
      <Dialog
        :width="numWidth"
        v-bind="restProps"
        :title="title"
        :keyboard="keyboard"
        :mask-closable="maskClosable"
        :z-index="zIndex"
        :get-container="getContainer === undefined ? getContextPopupContainer : getContainer"
        :prefix-cls="prefixCls"
        :root-class-name="clsx(hashId, rootClassName, cssVarCls, rootCls, mergedClassNames.root)"
        :root-style="mergedStyles.root"
        :footer="dialogFooter"
        :visible="open"
        :mouse-position="customizeMousePosition ?? mousePosition"
        @close="handleCancel"
        :closable="mergedClosable"
        :close-icon="mergedCloseIcon"
        :focus-trigger-after-close="focusTriggerAfterClose"
        :transition-name="getTransitionName(rootPrefixCls, 'zoom', transitionName)"
        :mask-transition-name="getTransitionName(rootPrefixCls, 'fade', maskTransitionName)"
        :mask="mergedMask"
        :class="clsx(hashId, className, contextClassName)"
        :style="{
          ...contextStyle,
          ...style,
          ...responsiveWidthVars,
        }"
        :class-names="{
          ...mergedClassNames,
          wrapper: clsx(mergedClassNames.wrapper, wrapClassNameExtended),
        }"
        :styles="mergedStyles"
        :destroy-on-hidden="destroyOnHidden"
        :ref="mergedPanelRef"
      >
        <Skeleton v-if="loading" active :title="false" :paragraph="{ rows: 4 }" :class="`${prefixCls}-body-skeleton`" />
        <slot v-else></slot>
      </Dialog>
    </ZIndexContextProvider>
  </ContextIsolator>
</template>
