<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import { computed } from 'vue';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import type { ButtonColorType, ButtonProps, ButtonType, ButtonVariantType } from './buttonHelpers';
import useStyle from './style';

type ColorVariantPairType = [color?: ButtonColorType, variant?: ButtonVariantType];

const props = withDefaults(defineProps<ButtonProps>(), { danger: false, shape: 'default', iconPosition: 'start' });

const ButtonTypeMap: Partial<Record<ButtonType, ColorVariantPairType>> = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  // `link` is not a real color but we should compatible with it
  link: ['link' as any, 'link'],
  text: ['default', 'text'],
};

const mergedType = computed(() => props.type || 'default');

const { button } = useConfigContextInject();

const parsedColor = computed((): ColorVariantPairType => {
  if (props.color && props.variant) {
    return [props.color, props.variant];
  }
  if (props.type || props.danger) {
    const colorVariantPair = ButtonTypeMap[mergedType.value] || [];
    if (props.danger) {
      return ['danger', colorVariantPair[1]];
    }
    return colorVariantPair;
  }
  if (button?.color && button?.variant) {
    return [button.color, button.variant];
  }
  return ['default', 'outlined'];
});

const mergedColor = computed((): ColorVariantPairType => {
  if (props.ghost && parsedColor.value[1] === 'solid') {
    return [parsedColor.value[0], 'outlined'];
  }
  return [parsedColor.value[0], parsedColor.value[1]];
});

const isDanger = computed(() => mergedColor.value[0] === 'danger');
const mergedColorText = computed(() => (isDanger.value ? 'dangerous' : mergedColor.value[0]));

const { getPrefixCls } = useComponentConfig('button');

const prefixCls = getPrefixCls('btn', props.prefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls);

const classes = computed(() => {
  return cn(prefixCls, hashId, cssVarCls, {
    [`${prefixCls}-${props.shape}`]: props.shape !== 'default' && props.shape !== 'square' && props.shape,
    // Compatible with versions earlier than 5.21.0
    [`${prefixCls}-${mergedType.value}`]: mergedType.value,
    [`${prefixCls}-dangerous`]: props.danger,

    [`${prefixCls}-color-${mergedColorText.value}`]: mergedColorText.value,
    [`${prefixCls}-variant-${mergedColor.value[1]}`]: mergedColor.value[1],
    [`${prefixCls}-default`]: true,
  });
});
</script>
<template>
  <div :class="classes">111</div>
</template>
