<script lang="tsx" setup>
import Portal from '@/vc-component/portal';
import { isDOM } from '@/vc-util/Dom/findDOMNode';
import { clsx } from 'clsx';
import { computed, ref, shallowRef, watch } from 'vue';
import {
  type TriggerContextProps,
  TriggerContextProvider,
  type UniqueContextProps,
  UniqueContextProvider,
  type UniqueShowOptions,
  useTriggerContextInject,
} from '../context';
import useAlign from '../hooks/useAlign';
import useDelay from '../hooks/useDelay';
import Popup from '../Popup/index.vue';
import { getAlignPopupClassName } from '../util';
import UniqueContainer from './UniqueContainer.vue';
import useTargetState from './useTargetState';

export interface UniqueProviderProps {
  /** Additional handle options data to do the customize info */
  postTriggerProps?: (options: UniqueShowOptions) => UniqueShowOptions;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { postTriggerProps } = defineProps<UniqueProviderProps>();

const [trigger, open, options, onTargetVisibleChanged] = useTargetState();

// ========================== Options ===========================
const mergedOptions = computed(() => {
  if (!options.value || !postTriggerProps) {
    return options.value;
  }

  return postTriggerProps(options.value);
});

// =========================== Popup ============================
const popupEle = ref<HTMLDivElement>(null);
const popupSize = ref<{ width: number; height: number }>(null);

// Used for forwardRef popup. Not use internal
const externalPopupRef = shallowRef<HTMLDivElement>(null);

const setPopupRef = (node) => {
  const { el } = node || {};
  externalPopupRef.value = el;

  if (isDOM(el) && popupEle.value !== el) {
    popupEle.value = el;
  }
};

// ========================== Register ==========================
// Store the isOpen function from the latest show call
const isOpenRef = shallowRef<(() => boolean) | null>(null);

const delayInvoke = useDelay();

const show = (showOptions: UniqueShowOptions, isOpen: () => boolean) => {
  // Store the isOpen function for later use in hide
  isOpenRef.value = isOpen;

  delayInvoke(() => {
    trigger(showOptions);
  }, showOptions.delay);
};

const hide = (delay: number) => {
  delayInvoke(() => {
    // Check if we should still hide by calling the isOpen function
    // If isOpen returns true, it means another trigger wants to keep it open
    if (isOpenRef.value?.()) {
      return; // Don't hide if something else wants it open
    }

    trigger(false);
    // Don't clear target, currentNode, options immediately, wait until animation completes
  }, delay);
};

// Callback after animation completes
const onVisibleChanged = (visible: boolean) => {
  // Call useTargetState callback to handle animation state
  onTargetVisibleChanged(visible);
};

// =========================== Align ============================
const [
  ready,
  offsetX,
  offsetY,
  offsetR,
  offsetB,
  arrowX,
  arrowY, // scaleX - not used in UniqueProvider
  ,
  ,
  // scaleY - not used in UniqueProvider
  alignInfo,
  onAlign,
] = useAlign(
  open,
  popupEle,
  computed(() => mergedOptions?.value?.target),
  computed(() => mergedOptions?.value?.popupPlacement),
  computed(() => mergedOptions?.value?.builtinPlacements || {}),
  computed(() => mergedOptions?.value?.popupAlign),
  undefined, // onPopupAlign
  computed(() => false), // isMobile
);

const alignedClassName = computed(() => {
  if (!mergedOptions.value) {
    return '';
  }

  const baseClassName = getAlignPopupClassName(
    mergedOptions.value?.builtinPlacements || {},
    mergedOptions.value?.prefixCls || '',
    alignInfo.value,
    false, // alignPoint is false for UniqueProvider
  );

  return clsx(baseClassName, mergedOptions.value?.getPopupClassNameFromAlign?.(alignInfo.value));
});

const contextValue = computed<UniqueContextProps>(() => ({
  show,
  hide,
}));

// =========================== Align ============================
watch(
  () => mergedOptions.value?.target,
  () => {
    onAlign();
  },
  { immediate: true, deep: true },
);

// =========================== Motion ===========================
const onPrepare = () => {
  onAlign();

  return Promise.resolve();
};

// ======================== Trigger Context =====================
const subPopupElements = shallowRef<Record<string, HTMLElement>>({});
const parentContext = useTriggerContextInject();

const triggerContextValue = computed<TriggerContextProps>(() => ({
  registerSubPopup: (id, subPopupEle) => {
    subPopupElements.value[id] = subPopupEle;
    parentContext?.registerSubPopup(id, subPopupEle);
  },
}));

// =========================== Render ===========================
const prefixCls = computed(() => mergedOptions.value?.prefixCls);
</script>
<template>
  <UniqueContextProvider :value="contextValue">
    <slot></slot>
    <TriggerContextProvider v-if="mergedOptions" :value="triggerContextValue">
      <Popup
        :ref="setPopupRef"
        :portal="Portal"
        :prefix-cls="prefixCls"
        :popup="mergedOptions.popup"
        :class="clsx(mergedOptions.popupClassName, alignedClassName, `${prefixCls}-unique-controlled`)"
        :style="mergedOptions.popupStyle"
        :target="mergedOptions.target"
        :open="open"
        keep-dom
        fresh
        :auto-destroy="false"
        @visible-changed="onVisibleChanged"
        :ready="ready"
        :offset-x="offsetX"
        :offset-y="offsetY"
        :offset-r="offsetR"
        :offset-b="offsetB"
        @align="onAlign"
        @prepare="onPrepare"
        @resize="
          (size) => {
            popupSize = {
              width: size.offsetWidth,
              height: size.offsetHeight,
            };
          }
        "
        :arrow-pos="{ x: arrowX, y: arrowY }"
        :align="alignInfo"
        :z-index="mergedOptions.zIndex"
        :mask="mergedOptions.mask"
        :arrow="mergedOptions.arrow"
        :motion="mergedOptions.popupMotion"
        :mask-motion="mergedOptions.maskMotion"
        :get-popup-container="mergedOptions.getPopupContainer"
      >
        <UniqueContainer
          :prefix-cls="prefixCls"
          :is-mobile="false"
          :ready="ready"
          :open="open"
          :align="alignInfo"
          :offset-r="offsetR"
          :offset-b="offsetB"
          :offset-x="offsetX"
          :offset-y="offsetY"
          :arrow-pos="{ x: arrowX, y: arrowY }"
          :popup-size="popupSize"
          :motion="mergedOptions.popupMotion"
          :unique-container-class-name="clsx(mergedOptions.uniqueContainerClassName, alignedClassName)"
          :unique-container-style="mergedOptions.uniqueContainerStyle"
        />
      </Popup>
    </TriggerContextProvider>
  </UniqueContextProvider>
</template>
