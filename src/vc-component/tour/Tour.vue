<script lang="tsx" setup>
import Trigger from '@/vc-component/trigger';
import { reactiveComputed } from '@vueuse/core';
import clsx from 'clsx';
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import { useClosable } from './hooks/useClosable';
import useTarget from './hooks/useTarget';
import type { TourProps, TourStepInfo } from './interface';
import { getPlacements } from './placements';
import { CENTER_PLACEHOLDER, defaultScrollIntoViewOptions, getPlacement } from './util';
import TourStep from './TourStep/index.vue';
import Placeholder from './Placeholder.vue';
import Mask from './Mask.vue';

export type { TourProps };

const {
  prefixCls = 'rc-tour',
  steps = [],
  onChange,
  onClose,
  onFinish,
  mask = true,
  arrow = true,
  rootClassName,
  placement,
  renderPanel,
  gap,
  animated,
  scrollIntoViewOptions = defaultScrollIntoViewOptions,
  zIndex = 1001,
  closeIcon,
  closable,
  builtinPlacements,
  disabledInteraction,
  styles,
  classNames: tourClassNames,
  class: className,
  style,
  getPopupContainer,
  ...restProps
} = defineProps<TourProps>();

const triggerRef = useTemplateRef('triggerRef');

const mergedCurrent = defineModel('current', {
  default: 0,
});

const mergedOpen = defineModel('open', {
  default: undefined,
  get: (origin) => (mergedCurrent.value < 0 || mergedCurrent.value >= steps.length ? false : (origin ?? true)),
});

// Record if already rended in the DOM to avoid `findDOMNode` issue
const hasOpened = ref(mergedOpen.value);

const openRef = ref(mergedOpen.value);

watch(
  mergedOpen,
  async () => {
    await nextTick();
    if (mergedOpen.value) {
      if (!openRef.value) {
        mergedCurrent.value = 0;
      }

      hasOpened.value = true;
    }
    openRef.value = mergedOpen.value;
  },
  { immediate: true, flush: 'post' },
);

const currentStep = reactiveComputed(() => {
  return steps[mergedCurrent.value] || ({} as TourStepInfo);
});

const stepScrollIntoViewOptions = computed(() => currentStep.scrollIntoViewOptions || defaultScrollIntoViewOptions);

const mergedClosable = useClosable(
  computed(() => currentStep.closable),
  computed(() => currentStep.closeIcon),
  computed(() => closable),
  computed(() => closeIcon),
);

const mergedMask = computed(() => mergedOpen.value && (currentStep.mask ?? mask));
const mergedScrollIntoViewOptions = computed(() => stepScrollIntoViewOptions.value ?? scrollIntoViewOptions);

// ====================== Align Target ======================
const placeholderRef = useTemplateRef('placeholderRef');

const inlineMode = computed(() => getPopupContainer === false);

const [posInfo, targetElement] = useTarget(
  computed(() => currentStep.target),
  mergedOpen,
  computed(() => gap),
  mergedScrollIntoViewOptions,
  inlineMode,
  placeholderRef,
);
const mergedPlacement = getPlacement(
  targetElement,
  computed(() => placement),
  computed(() => currentStep.placement),
);

// ========================= arrow =========================
const mergedArrow = computed(() =>
  targetElement.value ? (typeof currentStep.arrow === 'undefined' ? arrow : currentStep.arrow) : false,
);
const arrowPointAtCenter = computed(() => (typeof mergedArrow.value === 'object' ? mergedArrow.value?.pointAtCenter : false));

watch(
  [arrowPointAtCenter, mergedCurrent],
  () => {
    nextTick(() => {
      triggerRef.value?.forceAlign();
    });
  },
  { immediate: true, flush: 'post' },
);

// ========================= Change =========================
const onInternalChange = (nextCurrent: number) => {
  mergedCurrent.value = nextCurrent;
  onChange?.(nextCurrent);
};

const mergedBuiltinPlacements = computed(() => {
  if (builtinPlacements) {
    return typeof builtinPlacements === 'function'
      ? builtinPlacements({ arrowPointAtCenter: arrowPointAtCenter.value })
      : builtinPlacements;
  }
  return getPlacements(arrowPointAtCenter.value);
});

const handleClose = () => {
  mergedOpen.value = false;
  onClose?.(mergedCurrent.value);
};

const mergedShowMask = computed(() => (typeof mergedMask.value === 'boolean' ? mergedMask.value : !!mergedMask.value));
const mergedMaskStyle = computed(() => (typeof mergedMask.value === 'boolean' ? undefined : mergedMask.value));

// when targetElement is not exist, use body as triggerDOMNode
const fallbackDOM = () => {
  return targetElement.value || document.body;
};

const getPopupElement = () => (
  <TourStep
    styles={styles}
    classNames={tourClassNames}
    arrow={mergedArrow.value}
    key="content"
    prefixCls={prefixCls}
    total={steps.length}
    renderPanel={renderPanel}
    onPrev={() => {
      onInternalChange(mergedCurrent.value - 1);
    }}
    onNext={() => {
      onInternalChange(mergedCurrent.value + 1);
    }}
    onClose={handleClose}
    current={mergedCurrent.value}
    onFinish={() => {
      handleClose();
      onFinish?.();
    }}
    {...steps[mergedCurrent.value]}
    closable={mergedClosable.value}
  />
);

defineExpose({
  get el() {
    return 1;
  },
});
</script>
<template>
  <Mask
    :get-popup-container="getPopupContainer"
    :styles="styles"
    :class-names="tourClassNames"
    :z-index="zIndex"
    :prefix-cls="prefixCls"
    :pos="posInfo"
    :show-mask="mergedShowMask"
    :style="mergedMaskStyle?.style"
    :fill="mergedMaskStyle?.color"
    :open="mergedOpen"
    :animated="animated"
    :root-class-name="rootClassName"
    :disabled-interaction="disabledInteraction"
  />
  <Trigger
    v-bind="restProps"
    :get-popup-container="getPopupContainer"
    :builtin-placements="mergedBuiltinPlacements"
    ref="triggerRef"
    :popup-style="currentStep.style"
    :popup-placement="mergedPlacement"
    :popup-visible="mergedOpen"
    :popup-class-name="clsx(rootClassName, currentStep.class)"
    :prefix-cls="prefixCls"
    :popup="getPopupElement"
    :force-render="false"
    auto-destroy
    :z-index="zIndex + 1"
    :arrow="!!mergedArrow"
  >
    <Placeholder
      :open="mergedOpen"
      :auto-lock="!inlineMode"
      :get-container="getPopupContainer"
      ref="placeholderRef"
      :fallback-dom="fallbackDOM"
      :class="clsx(className, rootClassName, `${prefixCls}-target-placeholder`)"
      :style="{
        ...(posInfo
          ? {
              left: `${posInfo.left}px`,
              top: `${posInfo.top}px`,
              width: `${posInfo.width}px`,
              height: `${posInfo.height}px`,
              borderRadius: `${posInfo.radius}px`,
            }
          : CENTER_PLACEHOLDER),
        position: inlineMode ? 'absolute' : 'fixed',
        pointerEvents: 'none',
        ...style,
      }"
    />
  </Trigger>
</template>
