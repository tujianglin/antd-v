<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { AlignType, BuildInPlacements } from '@/vc-component/trigger';
import Trigger from '@/vc-component/trigger';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { usePickerContextInject } from '../PickerInput/context';
import { getRealPlacement } from '../utils/uiUtil';
import { BUILT_IN_PLACEMENTS } from './util';

export type PickerTriggerProps = {
  popupElement: VueNode;
  popupStyle?: CSSProperties;
  transitionName?: string;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  popupAlign?: AlignType;
  range?: boolean;

  // Placement
  popupClassName?: string;
  placement?: string;
  builtinPlacements?: BuildInPlacements;
  direction?: 'ltr' | 'rtl';

  // Visible
  visible: boolean;
  onClose: () => void;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  popupElement,
  popupStyle,
  popupClassName,
  popupAlign,
  transitionName,
  getPopupContainer,
  range,
  placement,
  builtinPlacements = BUILT_IN_PLACEMENTS,
  direction,

  // Visible
  visible,
  onClose,
} = defineProps<PickerTriggerProps>();

const { prefixCls } = toRefs(usePickerContextInject());
const dropdownPrefixCls = computed(() => `${prefixCls.value}-dropdown`);

const realPlacement = computed(() => getRealPlacement(placement, direction === 'rtl'));
</script>
<template>
  <Trigger
    :show-action="[]"
    :hide-action="['click']"
    :popup-placement="realPlacement"
    :builtin-placements="builtinPlacements"
    :prefix-cls="dropdownPrefixCls"
    :popup-motion="{ motionName: transitionName }"
    :popup-align="popupAlign"
    :popup-visible="visible"
    :popup-class-name="
      clsx(popupClassName, {
        [`${dropdownPrefixCls}-range`]: range,
        [`${dropdownPrefixCls}-rtl`]: direction === 'rtl',
      })
    "
    :popup-style="popupStyle"
    stretch="minWidth"
    :get-popup-container="getPopupContainer"
    @open-change="
      (nextVisible) => {
        if (!nextVisible) {
          onClose();
        }
      }
    "
  >
    <template #popup>
      <Render :content="popupElement" />
    </template>
    <slot></slot>
  </Trigger>
</template>
