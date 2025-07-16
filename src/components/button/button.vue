<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import { reactiveComputed } from '@vueuse/core';
import { computed, ref, toRefs, watch } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import {
  isUnBorderedButtonVariant,
  type BaseButtonProps,
  type ButtonColorType,
  type ButtonProps,
  type ButtonType,
  type ButtonVariantType,
} from './buttonHelpers';
import useStyle from './style';

type ColorVariantPairType = [color?: ButtonColorType, variant?: ButtonVariantType];
type LoadingConfigType = {
  loading: boolean;
  delay: number;
};

const {
  _skipSemantic,
  loading = false,
  prefixCls: customizePrefixCls,
  color,
  variant,
  type,
  danger = false,
  shape = 'default',
  size: customizeSize,
  disabled: customDisabled,
  className,
  rootClassName,
  icon,
  iconPosition = 'start',
  ghost = false,
  block = false,
  htmlType = 'button',
  classNames: buttonClassNames,
  styles,
  style: customStyle = {},
  ...rest
} = defineProps<ButtonProps>();

function getLoadingConfig(loading: BaseButtonProps['loading']): LoadingConfigType {
  if (typeof loading === 'object' && loading) {
    let delay = loading?.delay;
    delay = !Number.isNaN(delay) && typeof delay === 'number' ? delay : 0;
    return {
      loading: delay <= 0,
      delay,
    };
  }

  return {
    loading: !!loading,
    delay: 0,
  };
}

const ButtonTypeMap: Partial<Record<ButtonType, ColorVariantPairType>> = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  // `link` is not a real color but we should compatible with it
  link: ['link' as any, 'link'],
  text: ['default', 'text'],
};

const mergedType = computed(() => type || 'default');

const context = useConfigContextInject();

const parsedColor = computed((): ColorVariantPairType => {
  if (color && variant) {
    return [color, variant];
  }
  if (type || danger) {
    const colorVariantPair = ButtonTypeMap[mergedType.value] || [];
    if (danger) {
      return ['danger', colorVariantPair[1]];
    }
    return colorVariantPair;
  }
  if (context.value.button?.color && context.value.button?.variant) {
    return [context.value.button.color, context.value.button.variant];
  }
  return ['default', 'outlined'];
});

const mergedColor = computed((): ColorVariantPairType => {
  if (ghost && parsedColor.value[1] === 'solid') {
    return [parsedColor.value[0], 'outlined'];
  }
  return [parsedColor.value[0], parsedColor.value[1]];
});

const isDanger = computed(() => mergedColor.value[0] === 'danger');
const mergedColorText = computed(() => (isDanger.value ? 'dangerous' : mergedColor.value[0]));

const {
  getPrefixCls,
  direction,
  className: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('button'));

// const mergedInsetSpace = computed(() => autoInsertSpace ?? contextAutoInsertSpace.value ?? true);

const prefixCls = computed(() => getPrefixCls.value('btn', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls.value);

const disbaled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disbaled);

const loadingOrDelay = computed((): LoadingConfigType => getLoadingConfig(loading));

const innerLoading = ref(false);

watch(loadingOrDelay, (val) => {
  innerLoading.value = val.loading;
});

const hasTwoCNChar = ref(false);

const { mergedClassNames, mergedStyles } = toRefs(
  reactiveComputed(() => {
    return useMergeSemantic(
      [_skipSemantic ? undefined : contextClassNames?.value, buttonClassNames],
      [_skipSemantic ? undefined : contextStyles?.value, styles],
    );
  }),
);

const sizeClassNameMap = { large: 'lg', small: 'sm', middle: undefined };

const sizeFullName = computed(() => useSize((ctxSize) => customizeSize ?? ctxSize));

const sizeCls = computed(() => (sizeFullName?.value ? (sizeClassNameMap[sizeFullName?.value] ?? '') : ''));

const iconType = computed(() => (innerLoading?.value ? 'loading' : icon));

// const linkButtonRestProps = computed(() => omit(rest as ButtonProps));

const classes = computed(() => {
  return cn(
    prefixCls.value,
    hashId,
    cssVarCls,
    {
      [`${prefixCls.value}-${shape}`]: shape !== 'default' && shape !== 'square' && shape,
      // Compatible with versions earlier than 5.21.0
      [`${prefixCls.value}-${mergedType?.value}`]: mergedType?.value,
      [`${prefixCls.value}-dangerous`]: danger,

      [`${prefixCls.value}-color-${mergedColorText?.value}`]: mergedColorText?.value,
      [`${prefixCls.value}-variant-${mergedColor?.value[1]}`]: mergedColor?.value[1],
      [`${prefixCls.value}-${sizeCls?.value}`]: sizeCls?.value,
      [`${prefixCls.value}-icon-only`]: !!iconType?.value,
      [`${prefixCls.value}-background-ghost`]: ghost && !isUnBorderedButtonVariant(mergedColor?.value[1]),
      [`${prefixCls.value}-loading`]: innerLoading?.value,
      [`${prefixCls.value}-two-chinese-chars`]: hasTwoCNChar?.value && !innerLoading?.value,
      [`${prefixCls.value}-block`]: block,
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      [`${prefixCls.value}-icon-end`]: iconPosition === 'end',
    },
    className,
    rootClassName,
    contextClassName,
    mergedClassNames.value?.root,
  );
});

const fullStyle = computed(() => ({
  ...mergedStyles.value?.root,
  ...contextStyle?.value,
  ...(customStyle as Record<string, string>),
}));
</script>
<template>
  <button v-bind="rest" :type="htmlType" :class="classes" :style="fullStyle" :disabled="mergedDisabled">
    <slot></slot>
  </button>
</template>
