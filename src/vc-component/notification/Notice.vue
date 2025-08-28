<script lang="tsx" setup>
import { Render } from '@/components';
import KeyCode from '@/vc-util/KeyCode';
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import type { NoticeConfig } from './interface';

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
  prefixCls: string;
  class?: string;
  style?: CSSProperties;
  eventKey: PropertyKey;

  onClick?: (e: MouseEvent) => void;
  onNoticeClose?: (key: PropertyKey) => void;
  hovering?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  style,
  class: className,
  duration = 4.5,
  showProgress,
  pauseOnHover = true,

  eventKey,
  content,
  closable,
  props: divProps,

  onClick,
  onNoticeClose,
  times,
  hovering: forcedHovering,
} = defineProps<NoticeProps & { times?: number }>();

const hovering = ref(false);
const percent = ref(0);
const spentTime = ref(0);
const mergedHovering = computed(() => forcedHovering || hovering.value);
const mergedShowProgress = computed(() => duration > 0 && showProgress);

// ======================== Close =========================
const onInternalClose = () => {
  onNoticeClose(eventKey);
};

const onCloseKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === KeyCode.ENTER) {
    onInternalClose();
  }
};

// ======================== Effect ========================
watch(
  [() => duration, mergedHovering, () => times],
  () => {
    if (!mergedHovering.value && duration > 0) {
      const start = Date.now() - spentTime.value;
      const timeout = setTimeout(
        () => {
          onInternalClose();
        },
        duration * 1000 - spentTime.value,
      );

      return () => {
        if (pauseOnHover) {
          clearTimeout(timeout);
        }
        spentTime.value = Date.now() - start;
      };
    }
  },
  { immediate: true, deep: true },
);

let animationFrame: number;

watch(
  [() => duration, spentTime, mergedHovering, mergedShowProgress, () => times],
  () => {
    if (!mergedHovering.value && mergedShowProgress.value && (pauseOnHover || spentTime.value === 0)) {
      const start = performance.now();

      const calculate = () => {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame((timestamp) => {
          const runtime = timestamp + spentTime.value - start;
          const progress = Math.min(runtime / (duration * 1000), 1);
          percent.value = progress * 100;
          if (progress < 1) {
            calculate();
          }
        });
      };

      calculate();

      return () => {};
    }
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  if (pauseOnHover) {
    cancelAnimationFrame(animationFrame);
  }
});

// ======================== Closable ========================
const closableObj = computed(() => {
  if (typeof closable === 'object' && closable !== null) {
    return closable;
  }
  return {};
});

const ariaProps = computed(() => pickAttrs(closableObj.value, true));

// ======================== Progress ========================
const validPercent = computed(() => 100 - (!percent.value || percent.value < 0 ? 0 : percent.value > 100 ? 100 : percent.value));

// ======================== Render ========================
const noticePrefixCls = computed(() => `${prefixCls}-notice`);

const vm = getCurrentInstance();
const changeRef = (instance) => {
  vm.exposed = instance || {};
  vm.exposeProxy = instance || {};
};
</script>
<template>
  <div
    v-bind="divProps"
    :ref="changeRef"
    :class="
      clsx(noticePrefixCls, className, {
        [`${noticePrefixCls}-closable`]: closable,
      })
    "
    :style="style"
    @mouseenter="
      (e) => {
        hovering = true;
        divProps?.onMousedown?.(e);
      }
    "
    @mouseleave="
      (e) => {
        hovering = false;
        divProps?.onMouseleave?.(e);
      }
    "
    @click="onClick"
  >
    <div :class="`${noticePrefixCls}-content`">
      <Render :content="content" />
    </div>
    <button
      v-if="closable"
      :class="`${noticePrefixCls}-close`"
      @keydown="onCloseKeyDown"
      aria-label="Close"
      v-bind="ariaProps"
      @click="
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          onInternalClose();
        }
      "
    >
      <Render :content="closableObj.closeIcon ?? 'x'" />
    </button>
    <progress v-if="mergedShowProgress" :class="`${noticePrefixCls}-progress`" max="100" :value="validPercent">
      {{ `${validPercent}%` }}
    </progress>
  </div>
</template>
