<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import { useConfigContextInject } from '../config-provider';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useStyle from './style';

export interface CheckableTagProps {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  /**
   * It is an absolute controlled component and has no uncontrolled mode.
   *
   * zh-cn 该组件为完全受控组件，不支持非受控用法。
   */
  checked: boolean;
  /**
   * @since 5.27.0
   */
  icon?: VueNode;
  onChange?: (checked: boolean) => void;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  style,
  class: className,
  checked,
  icon,
  onChange,
  onClick,
  disabled: customDisabled,
  ...restProps
} = defineProps<CheckableTagProps>();
const { getPrefixCls, tag } = toRefs(useConfigContextInject());

const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled?.value);

const handleClick = (e: MouseEvent) => {
  if (mergedDisabled.value) {
    return;
  }
  onChange?.(!checked);
  onClick?.(e);
};

const prefixCls = computed(() => getPrefixCls.value('tag', customizePrefixCls));

// Style
const [hashId, cssVarCls] = useStyle(prefixCls);

const cls = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-checkable`,
    {
      [`${prefixCls.value}-checkable-checked`]: checked,
      [`${prefixCls.value}-checkable-disabled`]: mergedDisabled.value,
    },
    tag?.value?.class,
    className,
    hashId.value,
    cssVarCls.value,
  ),
);
</script>
<template>
  <span v-bind="restProps" :style="{ ...style, ...tag?.style }" :class="cls" @click="handleClick">
    <Render :content="icon" />
    <span><slot></slot></span>
  </span>
</template>
