<script lang="tsx" setup>
import { computed, createVNode, getCurrentInstance, ref, toRefs, type AriaAttributes, type CSSProperties, type VNode } from 'vue';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons-vue';
import clsx from 'clsx';
import { useComponentConfig } from '../config-provider/context';
import useStyle from './style/index';
import pickAttrs from '@/vc-util/pickAttrs';
import CSSMotion from '@/vc-component/motion';
import { composeRef } from '@/vc-util/ref';
import Render from '@/vc-component/render';
import { keysToCamelCaseShallow } from '@/vc-util/props';
import type { VueNode } from '@/vc-util/type';
import { replaceElement } from '@/vc-util/Children/util';
import { propsToCamelCase } from '../_util/type';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';

export interface AlertRef {
  nativeElement: HTMLDivElement;
}

export type AlertSemanticName = 'root' | 'icon' | 'section' | 'title' | 'description' | 'actions';

export type AlertClassNamesType = SemanticClassNamesType<AlertProps, AlertSemanticName>;
export type AlertStylesType = SemanticStylesType<AlertProps, AlertSemanticName>;

export interface AlertProps {
  /** Type of Alert styles, options:`success`, `info`, `warning`, `error` */
  type?: 'success' | 'info' | 'warning' | 'error';
  /** Whether Alert can be closed */
  closable?: boolean | ({ closeIcon?: VueNode } & AriaAttributes);
  /** Content of Alert */
  title?: VueNode;
  /** Additional content of Alert */
  description?: VueNode;
  /** Callback when close Alert */
  onClose?: (e: MouseEvent) => void;
  /** Trigger when animation ending of Alert */
  afterClose?: () => void;
  /** Whether to show icon */
  showIcon?: boolean;
  /** https://www.w3.org/TR/2014/REC-html5-20141028/dom.html#aria-role-attribute */
  role?: string;
  style?: CSSProperties;
  prefixCls?: string;
  class?: string;
  classNames?: AlertClassNamesType;
  styles?: AlertStylesType;
  rootClassName?: string;
  banner?: boolean;
  icon?: VueNode;
  closeIcon?: VueNode | boolean;
  action?: VueNode;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
  id?: string;
}

interface IconNodeProps {
  type: AlertProps['type'];
  icon: AlertProps['icon'];
  prefixCls: AlertProps['prefixCls'];
  description: AlertProps['description'];
  class?: string;
  style?: CSSProperties;
}

type CloseIconProps = {
  isClosable: boolean;
  prefixCls: AlertProps['prefixCls'];
  closeIcon: AlertProps['closeIcon'];
  handleClose: AlertProps['onClose'];
  ariaProps: AriaAttributes;
};

defineOptions({ name: 'Alert', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  description,
  prefixCls: customizePrefixCls,
  title,
  banner,
  class: className,
  rootClassName,
  style,
  onMouseenter,
  onMouseleave,
  onClick,
  afterClose,
  showIcon,
  closable,
  closeIcon = undefined,
  action,
  id,
  styles,
  classNames,
  ...otherProps
} = defineProps<AlertProps>();

const slots = defineSlots<{ action?: () => VNode[]; description?: () => VNode[]; icon?: () => VNode[]; title?: () => VNode[] }>();

const iconMapFilled = {
  success: CheckCircleFilled,
  info: InfoCircleFilled,
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled,
};
const IconNode = (props: IconNodeProps) => {
  const { icon, prefixCls, type, class: className, style } = keysToCamelCaseShallow(props);
  const iconType = iconMapFilled[type!] || null;
  if (icon || slots.icon) {
    return replaceElement(
      icon,
      <span class={`${prefixCls}-icon`}>
        <Render content={slots.icon || icon}></Render>
      </span>,
      () => ({
        class: clsx(icon.props.className, className),
        style,
      }),
    );
  }
  return createVNode(iconType, {
    class: className,
    style,
  });
};

const CloseIconNode = (props: CloseIconProps) => {
  const { isClosable, prefixCls, closeIcon, handleClose, ariaProps } = propsToCamelCase(props);
  const mergedCloseIcon = closeIcon === true || closeIcon === undefined ? <CloseOutlined /> : closeIcon;
  return isClosable ? (
    <button type="button" onClick={handleClose} class={`${prefixCls}-close-icon`} tabindex={0} {...ariaProps}>
      <Render content={mergedCloseIcon}></Render>
    </button>
  ) : null;
};

const closed = ref(false);

const internalRef = ref<HTMLDivElement>(null);

defineExpose({
  get nativeElement() {
    return internalRef.value;
  },
});

const {
  getPrefixCls,
  direction,
  closable: contextClosable,
  closeIcon: contextCloseIcon,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('alert'));
const prefixCls = computed(() => getPrefixCls.value('alert', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const handleClose = (e: MouseEvent) => {
  closed.value = true;
  otherProps?.onClose?.(e);
};

const type = computed<AlertProps['type']>(() => {
  if (otherProps.type !== undefined) {
    return otherProps.type;
  }
  // banner mode defaults to 'warning'
  return banner ? 'warning' : 'info';
});

// closeable when closeText or closeIcon is assigned
const isClosable = computed<boolean>(() => {
  if (typeof closable === 'object' && closable.closeIcon) return true;
  if (typeof closable === 'boolean') {
    return closable;
  }
  // should be true when closeIcon is 0 or ''
  if (closeIcon !== false && closeIcon !== null && closeIcon !== undefined) {
    return true;
  }

  return !!contextClosable.value;
});

// banner mode defaults to Icon
const isShowIcon = computed(() => (banner && showIcon === undefined ? true : showIcon));

const vm = getCurrentInstance();
// =========== Merged Props for Semantic ==========
const mergedProps = computed<AlertProps>(() => ({
  ...vm.props,
  prefixCls: prefixCls.value,
  type: type.value,
  showIcon: isShowIcon.value,
  closable: isClosable.value,
}));

const [mergedClassNames, mergedStyles] = useMergeSemantic<AlertClassNamesType, AlertStylesType, AlertProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: mergedProps.value,
  })),
);

const alertCls = computed(() => {
  return clsx(
    prefixCls.value,
    `${prefixCls.value}-${type.value}`,
    {
      [`${prefixCls.value}-with-description`]: !!(slots.description || description),
      [`${prefixCls.value}-no-icon`]: !isShowIcon.value,
      [`${prefixCls.value}-banner`]: !!banner,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    contextClassName?.value,
    className,
    rootClassName,
    mergedClassNames.value.root,
    cssVarCls.value,
    hashId.value,
  );
});

const restProps = computed(() => pickAttrs(otherProps, { aria: true, data: true }));

const mergedCloseIcon = computed(() => {
  if (typeof closable === 'object' && closable.closeIcon) {
    return closable.closeIcon;
  }

  if (closeIcon !== undefined) {
    return closeIcon;
  }
  if (typeof contextClosable?.value === 'object' && contextClosable.value.closeIcon) {
    return contextClosable.value.closeIcon;
  }
  return contextCloseIcon?.value;
});

const mergedAriaProps = computed(() => {
  const merged = closable ?? (contextClosable.value as any);
  if (typeof merged === 'object') {
    const { closeIcon: _, ...ariaProps } = merged;
    return ariaProps;
  }
  return {};
});
</script>
<template>
  <CSSMotion
    :visible="!closed"
    :motion-name="`${prefixCls}-motion`"
    :motion-appear="false"
    :motion-enter="false"
    @leave-start="(node) => ({ maxHeight: `${node.offsetHeight}px` })"
    @leave-end="afterClose"
  >
    <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
      <div
        :id="id"
        :ref="composeRef((el) => (internalRef = el), motionRef)"
        :data-show="!closed"
        :class="clsx(alertCls, motionClassName)"
        :style="{
          ...mergedStyles.root,
          ...contextStyle,
          ...style,
          ...motionStyle,
        }"
        @mouseenter="onMouseenter"
        @mousemove="onMouseleave"
        @click="onClick"
        role="alert"
        v-bind="restProps"
      >
        <IconNode
          v-if="isShowIcon"
          :class="clsx(`${prefixCls}-icon`, mergedClassNames.icon)"
          :style="mergedStyles.icon"
          :description="slots.description || description"
          :icon="otherProps.icon"
          :prefix-cls="prefixCls"
          :type="type"
        />
        <div :class="clsx(`${prefixCls}-section`, mergedClassNames.section)" :style="mergedStyles?.section">
          <div
            v-if="slots.title || title"
            :class="clsx(`${prefixCls}-title`, mergedClassNames.title)"
            :style="mergedStyles?.title"
          >
            <Render :content="slots.title || title" />
          </div>
          <div
            v-if="slots.description || description"
            :class="clsx(`${prefixCls}-description`, mergedClassNames.description)"
            :style="mergedStyles?.description"
          >
            <Render :content="slots.description || description" />
          </div>
        </div>
        <div
          v-if="slots.action || action"
          :class="clsx(`${prefixCls}-actions`, mergedClassNames.actions)"
          :style="mergedStyles?.actions"
        >
          <Render :content="slots.action || action" />
        </div>
        <CloseIconNode
          :is-closable="isClosable"
          :prefix-cls="prefixCls"
          :close-icon="mergedCloseIcon"
          :handle-close="handleClose"
          :aria-props="mergedAriaProps"
        />
      </div>
    </template>
  </CSSMotion>
</template>
