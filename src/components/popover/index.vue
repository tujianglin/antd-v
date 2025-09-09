<script lang="tsx" setup>
import { cloneVNode, computed, toRefs, type VNode } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import type { AbstractTooltipProps } from '../tooltip/index.vue';
// CSSINJS
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import KeyCode from '@/vc-util/KeyCode';
import clsx from 'clsx';
import { isValidElement } from '../_util/isValidNode';
import { getTransitionName } from '../_util/motion';
import Tooltip from '../tooltip';
import useMergedArrow from '../tooltip/hook/useMergedArrow';
import Overlay from './Overlay.vue';
import useStyle from './style';

export interface PopoverProps extends AbstractTooltipProps {
  title?: any;
  content?: any;
  onOpenChange?: (open: boolean, e?: MouseEvent | KeyboardEvent) => void;
}

defineOptions({ name: 'Popover', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  title: defaultTitle,
  content: defaultContent,
  placement = 'top',
  trigger = 'hover',
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  onOpenChange,
  styles,
  classNames: popoverClassNames,
  motion,
  arrow: popoverArrow,
  autoAdjustOverflow = true,
  ...restProps
} = defineProps<PopoverProps>();

const slots = defineSlots<{ default?: () => VNode[]; title?: () => VNode[]; content?: () => VNode[] }>();

const title = computed(() => slots.title || defaultTitle);
const content = computed(() => slots.content || defaultContent);

const {
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  arrow: contextArrow,
} = toRefs(useComponentConfig('popover'));

const prefixCls = computed(() => getPrefixCls.value('popover', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls);
const rootPrefixCls = computed(() => getPrefixCls.value());
const mergedArrow = useMergedArrow(
  computed(() => popoverArrow),
  contextArrow,
);

const rootClassNames = computed(() =>
  clsx(hashId.value, cssVarCls.value, contextClassName?.value, contextClassNames?.value?.root, popoverClassNames?.root),
);
const bodyClassNames = computed(() => clsx(contextClassNames?.value?.body, popoverClassNames?.body));

const open = defineModel('open', { default: false });

const settingOpen = (value: boolean, e?: MouseEvent | KeyboardEvent) => {
  open.value = value || true;
  onOpenChange?.(value, e);
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.keyCode === KeyCode.ESC) {
    settingOpen(false, e);
  }
};

const onInternalOpenChange = (value: boolean) => {
  settingOpen(value);
};

const children = computed(() => flattenChildren(slots.default?.())?.[0]);
</script>
<template>
  <Tooltip
    v-bind="restProps"
    :auto-adjust-overflow="autoAdjustOverflow"
    :arrow="mergedArrow"
    :placement="placement"
    :trigger="trigger"
    :mouse-enter-delay="mouseEnterDelay"
    :mouse-leave-delay="mouseLeaveDelay"
    :prefix-cls="prefixCls"
    :class-names="{ root: rootClassNames, body: bodyClassNames }"
    :styles="{
      root: {
        ...contextStyles.root,
        ...contextStyle,
        ...styles?.root,
      },
      body: {
        ...contextStyles.body,
        ...styles?.body,
      },
    }"
    :open="open"
    @open-change="onInternalOpenChange"
    :motion="{
      motionName: getTransitionName(
        rootPrefixCls,
        'zoom-big',
        typeof motion?.motionName === 'string' ? motion?.motionName : undefined,
      ),
    }"
    :data-popover-inject="true"
  >
    <template #overlay>
      <Overlay v-if="title || content" :prefix-cls="prefixCls" :title="title" :content="content" />
    </template>
    <component
      v-if="children"
      :is="
        cloneVNode(children, {
          onKeydown: (e) => {
            if (isValidElement(children)) {
              children?.props?.onKeydown?.(e);
            }
            onKeyDown(e);
          },
        })
      "
    />
  </Tooltip>
</template>
