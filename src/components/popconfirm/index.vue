<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import { useComponentConfig } from '../config-provider/context';
import type { PopoverProps } from '../popover';
import Popover from '../popover';
import useMergedArrow from '../tooltip/hook/useMergedArrow';
import useStyle from './style';
import type { AbstractTooltipProps } from '../tooltip/index.vue';
import type { ButtonProps } from '../button';
import type { LegacyButtonType } from '../button/interface';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { computed, getCurrentInstance, toRefs } from 'vue';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import Overlay from './Overlay.vue';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import type { PopoverSemanticName } from '../popover/index.vue';

export type PopconfirmClassNamesType = SemanticClassNamesType<PopconfirmProps, PopoverSemanticName>;

export type PopconfirmStylesType = SemanticStylesType<PopconfirmProps, PopoverSemanticName>;

export interface PopconfirmProps extends AbstractTooltipProps {
  title: VueNode;
  description?: VueNode;
  disabled?: boolean;
  onConfirm?: (e?: MouseEvent) => void;
  onCancel?: (e?: MouseEvent) => void;
  okText?: VueNode;
  okType?: LegacyButtonType;
  cancelText?: VueNode;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  showCancel?: boolean;
  icon?: VueNode;
  onOpenChange?: (open: boolean, e?: MouseEvent | KeyboardEvent) => void;
  onPopupClick?: (e: MouseEvent) => void;
  classNames?: PopconfirmClassNamesType;
  styles?: PopconfirmStylesType;
}

export interface PopconfirmState {
  open?: boolean;
}

defineOptions({ name: 'Popconfirm', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  placement = 'top',
  trigger = 'click',
  okType = 'primary',
  icon = <ExclamationCircleFilled />,
  onOpenChange,
  styles,
  arrow: popconfirmArrow = true,
  classNames,
  showCancel = true,
  autoAdjustOverflow = true,
  ...restProps
} = defineProps<PopconfirmProps>();

const {
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
  arrow: contextArrow,
} = toRefs(useComponentConfig('popconfirm'));

const open = defineModel('open', { default: false });

const mergedArrow = useMergedArrow(
  computed(() => popconfirmArrow),
  contextArrow,
);

const settingOpen: PopoverProps['onOpenChange'] = (value, e) => {
  open.value = value;
  onOpenChange?.(value, e);
};

const close = (e: MouseEvent) => {
  settingOpen(false, e);
};

const onConfirm = (e: MouseEvent) => restProps.onConfirm?.call(this, e);

const onCancel = (e: MouseEvent) => {
  settingOpen(false, e);
  restProps.onCancel?.call(this, e);
};

const onInternalOpenChange: PopoverProps['onOpenChange'] = (value, e) => {
  const { disabled = false } = restProps;
  if (disabled) {
    return;
  }
  settingOpen(value, e);
};

const prefixCls = computed(() => getPrefixCls.value('popconfirm', customizePrefixCls));

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<PopconfirmClassNamesType, PopconfirmStylesType, PopconfirmProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      placement,
      trigger,
      styles,
      classNames,
    } as PopconfirmProps,
  })),
);

const rootClassNames = computed(() => clsx(prefixCls.value, contextClassName?.value, mergedClassNames?.value?.root));

useStyle(prefixCls);
</script>
<template>
  <Popover
    :arrow="mergedArrow"
    v-bind="omit(restProps, ['title'])"
    :trigger="trigger"
    :placement="placement"
    @open-change="onInternalOpenChange"
    :open="open"
    :class-names="{ root: rootClassNames, container: mergedClassNames.container, arrow: mergedClassNames.arrow }"
    :styles="{
      root: { ...contextStyle, ...mergedStyles.root },
      container: mergedStyles.container,
      arrow: mergedStyles.arrow,
    }"
    :data-popover-inject="true"
    :auto-adjust-overflow="autoAdjustOverflow"
  >
    <template #content>
      <Overlay
        v-bind="$props"
        :ok-type="okType"
        :icon="icon"
        :show-cancel="showCancel"
        :prefix-cls="prefixCls"
        :close="close"
        :on-confirm="onConfirm"
        :on-cancel="onCancel"
        :class-names="mergedClassNames"
        :styles="mergedStyles"
      />
    </template>
    <slot></slot>
  </Popover>
</template>
