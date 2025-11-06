<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs, type VNode } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import type { AbstractTooltipProps, SemanticName as TooltipSemanticName } from '../tooltip/index.vue';
// CSSINJS
import { cloneElement, isValidElement } from '@/vc-util/Children/util';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import KeyCode from '@/vc-util/KeyCode';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { getTransitionName } from '../_util/motion';
import Tooltip from '../tooltip';
import useMergedArrow from '../tooltip/hook/useMergedArrow';
import Overlay from './Overlay.vue';
import useStyle from './style';

export type PopoverSemanticName = TooltipSemanticName | 'title' | 'content';

export type PopoverClassNamesType = SemanticClassNamesType<PopoverProps, PopoverSemanticName>;

export type PopoverStylesType = SemanticStylesType<PopoverProps, PopoverSemanticName>;

export interface PopoverProps extends AbstractTooltipProps {
  title?: VueNode;
  content?: VueNode;
  onOpenChange?: (open: boolean, e?: MouseEvent | KeyboardEvent) => void;
  classNames?: PopoverClassNamesType;
  styles?: PopoverStylesType;
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
  classNames,
  motion,
  arrow: popoverArrow = undefined,
  autoAdjustOverflow = true,
  ...restProps
} = defineProps<PopoverProps>();

const slots = defineSlots<{
  default?: () => VNode[];
  title?: () => VNode[];
  content?: () => VNode[];
}>();

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

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<PopoverClassNamesType, PopoverStylesType, PopoverProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      placement,
      trigger,
      mouseEnterDelay,
      mouseLeaveDelay,
      styles,
      classNames,
    },
  })),
);

const rootClassNames = computed(() =>
  clsx(hashId.value, cssVarCls.value, contextClassName?.value, mergedClassNames?.value?.root),
);

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
    :class-names="{ root: rootClassNames, container: mergedClassNames.container, arrow: mergedClassNames.arrow }"
    :styles="{
      root: { ...mergedStyles.root, ...contextStyle },
      container: mergedStyles.container,
      arrow: mergedStyles.arrow,
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
        cloneElement(children, {
          ...$attrs,
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
