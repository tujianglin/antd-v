<script lang="tsx" setup>
import { computed, ref, toRefs, type CSSProperties, type VNode } from 'vue';
import type { IDialogPropTypes } from '../../IDialogPropTypes';
import { useRefContextInject } from '../../context';
import clsx from 'clsx';
import pickAttrs from '@/vc-util/pickAttrs';
import Render from '@/vc-component/render';
import MemoChildren from './MemoChildren.vue';
import { useComposeRef } from '@/vc-util/ref';

export interface PanelProps extends Omit<IDialogPropTypes, 'getOpenCount'> {
  prefixCls: string;
  ariaId?: string;
  onMousedown?: (e: MouseEvent) => void;
  onMouseup?: (e: MouseEvent) => void;
  holderRef?: HTMLDivElement;
}

export type PanelRef = {
  focus: () => void;
  changeActive: (next: boolean) => void;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  class: className,
  style,
  title,
  ariaId,
  footer,
  closable,
  closeIcon,
  onClose,
  bodyStyle,
  bodyProps,
  modalRender,
  onMousedown,
  onMouseup,
  holderRef,
  visible,
  forceRender,
  width,
  height,
  classNames: modalClassNames,
  styles: modalStyles,
} = defineProps<PanelProps>();

const slots = defineSlots<{ default?: () => VNode[] }>();

// ================================= Refs =================================
const { panel: panelRef } = toRefs(useRefContextInject());

const mergedRef = useComposeRef(holderRef, panelRef);
//
const sentinelStartRef = ref<HTMLDivElement>(null);
const sentinelEndRef = ref<HTMLDivElement>(null);

defineExpose({
  focus: () => {
    sentinelStartRef.value?.focus({ preventScroll: true });
  },
  changeActive: (next) => {
    const { activeElement } = document;
    if (next && activeElement === sentinelEndRef.value) {
      sentinelStartRef.value.focus({ preventScroll: true });
    } else if (!next && activeElement === sentinelStartRef.value) {
      sentinelEndRef.value.focus({ preventScroll: true });
    }
  },
});

// ================================ Style =================================
const contentStyle = computed(() => {
  const result = {} as CSSProperties;
  if (width !== undefined) {
    result.width = `${width}px`;
  }
  if (height !== undefined) {
    result.height = `${height}px`;
  }
  return result;
});

// ================================ Render ================================
const footerNode = () => {
  return footer ? (
    <div class={clsx(`${prefixCls}-footer`, modalClassNames?.footer)} style={{ ...modalStyles?.footer }}>
      <Render content={footer}></Render>
    </div>
  ) : null;
};

const headerNode = () => {
  return title ? (
    <div class={clsx(`${prefixCls}-header`, modalClassNames?.header)} style={{ ...modalStyles?.header }}>
      <div class={clsx(`${prefixCls}-title`, modalClassNames?.title)} id={ariaId} style={{ ...modalStyles?.title }}>
        <Render content={title}></Render>
      </div>
    </div>
  ) : null;
};

const closableObj = computed(() => {
  if (typeof closable === 'object' && closable !== null) {
    return closable;
  }
  if (closable) {
    return { closeIcon: closeIcon ?? <span class={`${prefixCls}-close-x`} /> };
  }
  return {};
});

const ariaProps = computed(() => pickAttrs(closableObj.value, true));
const closeBtnIsDisabled = computed(() => typeof closable === 'object' && closable.disabled);

const closerNode = () => {
  return closable ? (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      {...ariaProps.value}
      class={`${prefixCls}-close`}
      disabled={closeBtnIsDisabled.value}
    >
      <Render content={closableObj.value.closeIcon}></Render>
    </button>
  ) : null;
};

const content = () => {
  return (
    <div class={clsx(`${prefixCls}-container`, modalClassNames?.container)} style={modalStyles?.container}>
      {closerNode()}
      {headerNode()}
      <div class={clsx(`${prefixCls}-body`, modalClassNames?.body)} style={{ ...bodyStyle, ...modalStyles?.body }} {...bodyProps}>
        {slots.default?.()}
      </div>
      {footerNode()}
    </div>
  );
};

const sentinelStyle: CSSProperties = {
  width: 0,
  height: 0,
  overflow: 'hidden',
  outline: 'none',
};

const entityStyle: CSSProperties = {
  outline: 'none',
};
</script>
<template>
  <div
    key="dialog-element"
    role="dialog"
    :aria-labelledby="title ? ariaId : null"
    aria-modal="true"
    :ref="mergedRef"
    :style="{ ...style, ...contentStyle }"
    :class="clsx(prefixCls, className)"
    @mousedown="onMousedown"
    @mouseup="onMouseup"
  >
    <div ref="sentinelStartRef" :tabindex="0" :style="entityStyle">
      <MemoChildren :should-update="visible || forceRender">
        <component :is="modalRender ? modalRender(content) : content" />
      </MemoChildren>
    </div>
    <div :tabindex="0" ref="sentinelEndRef" :style="sentinelStyle"></div>
  </div>
</template>
