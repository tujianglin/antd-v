<script lang="tsx" setup>
import Trigger from '@/vc-component/trigger';
import type { CSSProperties } from 'vue';
import { computed } from 'vue';
import DropdownMenu from './DropdownMenu.vue';
import type { DataDrivenOptionProps, Direction, Placement } from './Mentions.vue';

interface KeywordTriggerProps {
  loading?: boolean;
  options: DataDrivenOptionProps[];
  prefixCls?: string;
  placement?: Placement;
  direction?: Direction;
  visible?: boolean;
  transitionName?: string;
  getPopupContainer?: () => HTMLElement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, options, visible, transitionName, getPopupContainer, popupClassName, popupStyle, direction, placement } =
  defineProps<KeywordTriggerProps>();

const BUILT_IN_PLACEMENTS = {
  bottomRight: {
    points: ['tl', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomLeft: {
    points: ['tr', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['bl', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['br', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};

const dropdownPrefix = computed(() => `${prefixCls}-dropdown`);

const dropdownPlacement = computed(() => {
  let popupPlacement;
  if (direction === 'rtl') {
    popupPlacement = placement === 'top' ? 'topLeft' : 'bottomLeft';
  } else {
    popupPlacement = placement === 'top' ? 'topRight' : 'bottomRight';
  }
  return popupPlacement;
});
</script>
<template>
  <Trigger
    :prefix-cls="dropdownPrefix"
    :popup-visible="visible"
    :popup-placement="dropdownPlacement"
    :popup-motion="{ motionName: transitionName }"
    :builtin-placements="BUILT_IN_PLACEMENTS"
    :get-popup-container="getPopupContainer"
    :popup-class-name="popupClassName"
    :popup-style="popupStyle"
  >
    <template #popup>
      <DropdownMenu :prefix-cls="dropdownPrefix" :options="options" />
    </template>
    <slot></slot>
  </Trigger>
</template>
