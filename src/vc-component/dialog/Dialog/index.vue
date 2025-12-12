<script lang="tsx" setup>
import contains from '@/vc-util/Dom/contains';
import KeyCode from '@/vc-util/KeyCode';
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import { computed, onBeforeUnmount, ref, useId, useTemplateRef, watch, type CSSProperties } from 'vue';
import type { IDialogPropTypes } from '../IDialogPropTypes';
import { getMotionName } from '../util';
import Content from './Content/index.vue';
import Mask from './Mask.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-dialog',
  zIndex,
  visible = false,
  keyboard = true,
  focusTriggerAfterClose = true,
  // scrollLocker,
  // Wrapper
  wrapStyle,
  wrapClassName,
  wrapProps,
  onClose,
  afterOpenChange,
  afterClose,

  // Dialog
  transitionName,
  animation,
  closable = true,

  // Mask
  mask = true,
  maskTransitionName,
  maskAnimation,
  maskClosable = true,
  maskStyle,
  maskProps,
  rootClassName,
  rootStyle,
  classNames: modalClassNames,
  styles: modalStyles,
} = defineProps<IDialogPropTypes>();

const lastOutSideActiveElementRef = ref<HTMLElement>(null);
const wrapperRef = useTemplateRef('wrapperRef');
const contentRef = useTemplateRef('contentRef');

const animatedVisible = ref(visible);
const isFixedPos = ref(false);

// ========================== Init ==========================
const ariaId = useId();

function saveLastOutSideActiveElementRef() {
  if (!contains(wrapperRef.value, document.activeElement)) {
    lastOutSideActiveElementRef.value = document.activeElement as HTMLElement;
  }
}

function focusDialogContent() {
  if (!contains(wrapperRef.value, document.activeElement)) {
    contentRef.value?.focus();
  }
}

// ========================= Events =========================
// Close action will trigger by:
//   1. When hide motion end
//   2. Controlled `open` to `false` immediately after set to `true` which will not trigger motion
function doClose() {
  // Clean up scroll bar & focus back

  if (mask && lastOutSideActiveElementRef.value && focusTriggerAfterClose) {
    try {
      lastOutSideActiveElementRef.value.focus({ preventScroll: true });
    } catch {
      // Do nothing
    }
    lastOutSideActiveElementRef.value = null;
  }

  // Trigger afterClose only when change visible from true to false
  if (animatedVisible.value) {
    afterClose?.();
  }
}

function onDialogVisibleChanged(newVisible: boolean) {
  // Try to focus
  if (newVisible) {
    focusDialogContent();
  } else {
    doClose();
  }
  afterOpenChange?.(newVisible);
  animatedVisible.value = newVisible;
}

function onInternalClose(e) {
  onClose?.(e);
}

// >>> Content
const contentClickRef = ref(false);
const contentTimeoutRef = ref<ReturnType<typeof setTimeout>>(null);

// We need record content click in case content popup out of dialog
const onContentMouseDown = () => {
  clearTimeout(contentTimeoutRef.value);
  contentClickRef.value = true;
};

const onContentMouseUp = () => {
  contentTimeoutRef.value = setTimeout(() => {
    contentClickRef.value = false;
  });
};

// >>> Wrapper
// Close only when element not on dialog
const onWrapperClick = computed(() => {
  if (maskClosable) {
    return (e) => {
      if (contentClickRef.value) {
        contentClickRef.value = false;
      } else if (wrapperRef.value === e.target) {
        onInternalClose(e);
      }
    };
  }
  return null;
});

function onWrapperKeyDown(e: KeyboardEvent) {
  if (keyboard && e.keyCode === KeyCode.ESC) {
    e.stopPropagation();
    onInternalClose(e);
    return;
  }
}

// ========================= Effect =========================
watch(
  () => visible,
  () => {
    if (visible) {
      animatedVisible.value = true;
      saveLastOutSideActiveElementRef();

      // Calc the position style
      if (wrapperRef.value) {
        const computedWrapStyle = getComputedStyle(wrapperRef.value);
        isFixedPos.value = computedWrapStyle.position === 'fixed';
      }
    } else if (animatedVisible.value && contentRef.value.enableMotion() && !contentRef.value.inMotion()) {
      doClose();
    }
  },
  { immediate: true, deep: true },
);

// Remove direct should also check the scroll bar update
onBeforeUnmount(() => {
  clearTimeout(contentTimeoutRef.value);
});

const mergedStyle = computed<CSSProperties>(() => ({
  zIndex,
  ...wrapStyle,
  ...modalStyles?.wrapper,
  display: !animatedVisible.value ? 'none' : null,
}));

defineExpose({
  get el() {
    return contentRef.value?.el;
  },
});
</script>
<template>
  <div :class="clsx(`${prefixCls}-root`, rootClassName)" :style="rootStyle" v-bind="pickAttrs($props, { data: true })">
    <Mask
      :prefix-cls="prefixCls"
      :visible="mask && visible"
      :motion-name="getMotionName(prefixCls, maskTransitionName, maskAnimation)"
      :style="{ zIndex, ...maskStyle, ...modalStyles?.mask }"
      :mask-props="maskProps"
      :class="modalClassNames?.mask"
    />
    <div
      @keydown="onWrapperKeyDown"
      :class="clsx(`${prefixCls}-wrap`, wrapClassName, modalClassNames?.wrapper)"
      ref="wrapperRef"
      @click="onWrapperClick"
      :style="mergedStyle"
      v-bind="wrapProps"
    >
      <Content
        v-bind="omit($props, ['onClose'])"
        :is-fixed-pos="isFixedPos"
        @mousedown="onContentMouseDown"
        @mouseup="onContentMouseUp"
        ref="contentRef"
        :closable="closable"
        :aria-id="ariaId"
        :prefix-cls="prefixCls"
        :visible="visible && animatedVisible"
        @close="onInternalClose"
        @visible-changed="onDialogVisibleChanged"
        :motion-name="getMotionName(prefixCls, transitionName, animation)"
      >
        <slot></slot>
      </Content>
    </div>
  </div>
</template>
