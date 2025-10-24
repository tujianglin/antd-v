<script lang="tsx" setup>
import Render from '@/vc-component/render';
import Trigger from '@/vc-component/trigger';
import type { AlignType, BuildInPlacements } from '@/vc-component/trigger/interface';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, useTemplateRef, type CSSProperties } from 'vue';
import type { Placement, RenderDOMFunc } from './interface';

export interface RefTriggerProps {
  getPopupElement: HTMLDivElement;
}

export interface SelectTriggerProps {
  prefixCls: string;
  disabled: boolean;
  visible: boolean;
  popupElement: VueNode;

  animation?: string;
  transitionName?: string;
  placement?: Placement;
  builtinPlacements?: BuildInPlacements;
  popupStyle?: CSSProperties;
  popupClassName?: string;
  direction?: string;
  popupMatchSelectWidth?: boolean | number;
  popupRender?: (menu: VueNode) => VueNode;
  getPopupContainer?: RenderDOMFunc;
  popupAlign?: AlignType;
  empty: boolean;

  onPopupVisibleChange?: (visible: boolean) => void;

  onPopupMouseEnter: () => void;
}

defineOptions({ name: 'SelectTrigger', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  disabled: _,
  visible,
  popupElement,
  animation,
  transitionName,
  popupStyle = {},
  popupClassName = '',
  direction = 'ltr',
  placement,
  builtinPlacements,
  popupMatchSelectWidth,
  popupRender,
  popupAlign = {},
  getPopupContainer,
  empty,
  onPopupVisibleChange,
  onPopupMouseEnter,
  ...restProps
} = defineProps<SelectTriggerProps>();

const getBuiltInPlacements = (popupMatchSelectWidth: number | boolean): Record<string, AlignType> => {
  // Enable horizontal overflow auto-adjustment when a custom dropdown width is provided
  const adjustX = popupMatchSelectWidth === true ? 0 : 1;
  return {
    bottomLeft: {
      points: ['tl', 'bl'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    bottomRight: {
      points: ['tr', 'br'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    topLeft: {
      points: ['bl', 'tl'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
    topRight: {
      points: ['br', 'tr'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
      htmlRegion: 'scroll',
    },
  };
};

// We still use `dropdown` className to keep compatibility
// This is used for:
// 1. Styles
// 2. Animation
// 3. Theme customization
// Please do not modify this since it's a breaking change
const popupPrefixCls = `${prefixCls}-dropdown`;

const popupNode = computed(() => {
  if (popupRender) {
    return popupRender(popupElement);
  }
  return popupElement;
});

const mergedBuiltinPlacements = computed(() => builtinPlacements || getBuiltInPlacements(popupMatchSelectWidth));

// ===================== Motion ======================
const mergedTransitionName = computed(() => (animation ? `${popupPrefixCls}-${animation}` : transitionName));

// =================== Popup Width ===================
const isNumberPopupWidth = computed(() => typeof popupMatchSelectWidth === 'number');

const stretch = computed(() => {
  if (isNumberPopupWidth.value) {
    return null;
  }
  return popupMatchSelectWidth === false ? 'minWidth' : 'width';
});

const mergedPopupStyle = computed(() => {
  let result = popupStyle;

  if (isNumberPopupWidth.value) {
    result = {
      ...popupStyle,
      width: `${popupMatchSelectWidth}px`,
    };
  }
  return result;
});

// ======================= Ref =======================
const triggerPopupRef = useTemplateRef('triggerPopupRef');

defineExpose({
  get getPopupElement() {
    return triggerPopupRef.value?.popupElement;
  },
});
</script>
<template>
  <Trigger
    v-bind="restProps"
    :show-action="onPopupVisibleChange ? ['click'] : []"
    :hide-action="onPopupVisibleChange ? ['click'] : []"
    :popup-placement="placement || (direction === 'rtl' ? 'bottomRight' : 'bottomLeft')"
    :builtin-placements="mergedBuiltinPlacements"
    :prefix-cls="popupPrefixCls"
    :popup-motion="{ motionName: mergedTransitionName }"
    ref="triggerPopupRef"
    :stretch="stretch"
    :popup-align="popupAlign"
    :popup-visible="visible"
    :get-popup-container="getPopupContainer"
    :popup-class-name="
      clsx(popupClassName, {
        [`${popupPrefixCls}-empty`]: empty,
      })
    "
    :popup-style="mergedPopupStyle"
    @open-change="onPopupVisibleChange"
  >
    <template #popup>
      <div @mousedown="onPopupMouseEnter"><Render :content="popupNode" /></div>
    </template>
    <slot></slot>
  </Trigger>
</template>
