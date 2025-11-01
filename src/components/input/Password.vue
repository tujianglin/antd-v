<script lang="tsx" setup>
import { cloneVNode, computed, ref, toRefs, useAttrs, useTemplateRef, watch, type VNode } from 'vue';
import { useConfigContextInject } from '../config-provider';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import type { InputProps } from './interface';
import { useRemovePasswordTimeout } from './hooks/useRemovePasswordTimeout';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import Input from './Input.vue';
import { omit } from 'lodash-es';
import Render from '@/vc-component/render';
import type { VueKey, VueNode } from '@/vc-util/type';
import type { InputRef } from '@/vc-component/input';
import { isValidNode } from '@/vc-util/Children/util';

interface VisibilityToggle {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export interface PasswordProps extends InputProps {
  readonly inputPrefixCls?: string;
  readonly action?: 'click' | 'hover';
  visibilityToggle?: boolean | VisibilityToggle;
  iconRender?: (visible: boolean) => VueNode;
}

defineOptions({ name: 'InputPassword', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  disabled: customDisabled = undefined,
  action = 'click',
  visibilityToggle = true,
  iconRender: customIconRender,
  class: className,
  prefixCls: customizePrefixCls,
  inputPrefixCls: customizeInputPrefixCls,
  size,
  ...restProps
} = defineProps<PasswordProps>();
const attrs = useAttrs();

const iconRender = computed(() => customIconRender || defaultIconRender);
function defaultIconRender(visible: boolean) {
  return visible ? <EyeOutlined /> : <EyeInvisibleOutlined />;
}

const actionMap: Record<VueKey, string> = {
  click: 'onClick',
  hover: 'onMouseOver',
};
// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const visibilityControlled = computed(() => typeof visibilityToggle === 'object' && visibilityToggle.visible !== undefined);
const visible = ref();
watch(
  [() => visibilityControlled.value, () => visibilityToggle],
  ([val1, val2]) => {
    visible.value = val1 ? (typeof val2 === 'object' && val2.visible)! : false;
  },
  { immediate: true, deep: true },
);
const inputRef = useTemplateRef<InputRef>('inputRef');

// Remove Password value
const removePasswordTimeout = useRemovePasswordTimeout(inputRef);

function onVisibleChange() {
  if (mergedDisabled.value) {
    return;
  }
  if (visible.value) {
    removePasswordTimeout?.();
  }

  const nextVisible = !visible.value;
  visible.value = nextVisible;
  if (typeof visibilityToggle === 'object') {
    visibilityToggle.onVisibleChange?.(nextVisible);
  }
}

const getIcon = (prefixCls: string) => {
  const iconTrigger = actionMap[action] || '';
  const icon = iconRender.value(visible.value);
  const iconProps = {
    [iconTrigger]: onVisibleChange,
    class: `${prefixCls}-icon`,
    key: 'passwordIcon',
    onMouseDown: (e) => {
      // Prevent focused state lost
      // https://github.com/ant-design/ant-design/issues/15173
      e.preventDefault();
    },
    onMouseUp: (e) => {
      // Prevent caret position change
      // https://github.com/ant-design/ant-design/issues/23524
      e.preventDefault();
    },
  };
  return cloneVNode(
    isValidNode(icon as VNode) ? (
      <Render content={icon} {...iconProps}></Render>
    ) : (
      <span {...iconProps}>
        <Render content={icon}></Render>
      </span>
    ),
  );
};

const { getPrefixCls } = toRefs(useConfigContextInject());
const inputPrefixCls = getPrefixCls.value('input', customizeInputPrefixCls);
const prefixCls = getPrefixCls.value('input-password', customizePrefixCls);

const suffixIcon = computed(() => visibilityToggle && getIcon(prefixCls));

const inputClassName = computed(() => {
  return clsx(prefixCls, className, {
    [`${prefixCls}-${size}`]: !!size,
  });
});
</script>

<template>
  <Input
    ref="inputRef"
    v-bind="
      omit(
        {
          ...restProps,
          ...attrs,
          disabled: customDisabled,
          action,
          visibilityToggle,
          iconRender,
        },
        ['suffix', 'iconRender', 'visibilityToggle'],
      )
    "
    :type="visible ? 'text' : 'password'"
    :class="inputClassName"
    :prefix-cls="inputPrefixCls"
    :suffix="suffixIcon"
    :size="size"
  />
</template>
