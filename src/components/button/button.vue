<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { computed, nextTick, ref, toRefs, unref, useAttrs, useSlots, useTemplateRef, watch } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import {
  isUnBorderedButtonVariant,
  spaceChildren,
  type BaseButtonProps,
  type ButtonColorType,
  type ButtonProps,
  type ButtonType,
  type ButtonVariantType,
} from './buttonHelpers';
import useStyle from './style';
import { Wave } from '../_util/wave';
import IconWrapper from './IconWrapper.vue';
import DefaultLoadingIcon from './DefaultLoadingIcon.vue';
import { cn } from '@/utils/cn';
import { omit } from 'lodash-es';
import isValidNode from '../_util/isValidNode';

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
  autoInsertSpace = false,
  autoFocus = false,
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

const slots = useSlots();

const slotVNodes = slots.default?.() || [];

const mergedType = computed(() => type || 'default');

const { button } = toRefs(useConfigContextInject());

const buttonRef = useTemplateRef<HTMLButtonElement | HTMLAnchorElement>('buttonRef');

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
  if (button.value?.color && button.value?.variant) {
    return [button.value.color, button.value.variant];
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
  autoInsertSpace: contextAutoInsertSpace,
  className: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('button'));

const needInserted = computed(() => slotVNodes.length === 1 && !icon && !isUnBorderedButtonVariant(mergedColor.value[1]));

const mergedInsertSpace = computed(() => autoInsertSpace ?? contextAutoInsertSpace.value ?? true);

const prefixCls = computed(() => getPrefixCls.value('btn', customizePrefixCls));
const [hashId, cssVarCls] = useStyle(prefixCls.value);

const disbaled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disbaled);

const loadingOrDelay = computed((): LoadingConfigType => getLoadingConfig(loading));

const innerLoading = ref(false);

watch(
  loadingOrDelay,
  (val) => {
    innerLoading.value = val.loading;
  },
  { immediate: true, deep: true },
);

watch(
  () => autoFocus,
  async (val) => {
    await nextTick();
    if (val) {
      buttonRef.value.focus();
    }
  },
  { immediate: true },
);

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

const linkButtonRestProps = computed(() => omit(rest as ButtonProps));

const classes = computed(() => {
  return cn(
    prefixCls.value,
    hashId,
    cssVarCls,
    {
      [`${prefixCls.value}-${shape}`]: shape !== 'default' && shape !== 'square' && shape,
      [`${prefixCls.value}-${mergedType?.value}`]: mergedType?.value,
      [`${prefixCls.value}-dangerous`]: danger,

      [`${prefixCls.value}-color-${mergedColorText?.value}`]: mergedColorText?.value,
      [`${prefixCls.value}-variant-${mergedColor?.value[1]}`]: mergedColor?.value[1],
      [`${prefixCls.value}-${sizeCls?.value}`]: sizeCls?.value,
      [`${prefixCls.value}-icon-only`]: !slotVNodes && slotVNodes.length !== 0 && !!iconType?.value,
      [`${prefixCls.value}-background-ghost`]: ghost && !isUnBorderedButtonVariant(mergedColor?.value[1]),
      [`${prefixCls.value}-loading`]: innerLoading.value,
      [`${prefixCls.value}-two-chinese-chars`]: hasTwoCNChar?.value && mergedInsertSpace.value && !innerLoading?.value,
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

const attrs = useAttrs() as {
  onClick: (e: MouseEvent) => void;
};

const fullStyle = computed(() => ({
  ...mergedStyles.value?.root,
  ...contextStyle?.value,
  ...(customStyle as Record<string, string>),
}));

const iconSharedProps = computed(() => ({
  className: mergedClassNames.value.icon,
  style: mergedStyles.value.icon,
}));

const IconNode = () => {
  return icon && !innerLoading.value ? (
    <IconWrapper prefixCls={prefixCls.value} {...unref(iconSharedProps)}>
      {icon}
    </IconWrapper>
  ) : loading && typeof loading === 'object' && loading.icon ? (
    <IconWrapper prefixCls={prefixCls.value} {...unref(iconSharedProps)}>
      {loading.icon}
    </IconWrapper>
  ) : (
    <DefaultLoadingIcon
      existIcon={!!icon}
      prefixCls={prefixCls.value}
      loading={innerLoading.value}
      {...unref(iconSharedProps)}
    ></DefaultLoadingIcon>
  );
};

const handleClick = (e: MouseEvent) => {
  if (innerLoading.value || mergedDisabled.value) {
    e.preventDefault();
    return;
  }
  attrs?.onClick?.(e);
};

const contentNode = isValidNode(slotVNodes)
  ? spaceChildren(
      slotVNodes,
      needInserted.value && mergedInsertSpace.value,
      mergedStyles.value.content,
      mergedClassNames.value.content,
    )
  : null;
</script>
<template>
  <template v-if="linkButtonRestProps.href !== undefined">
    <a
      ref="buttonRef"
      v-bind="linkButtonRestProps"
      :class="cn(classes, { [`${prefixCls}-disabled`]: mergedDisabled })"
      :href="mergedDisabled ? undefined : linkButtonRestProps.href"
      :style="fullStyle"
      @click="handleClick"
      :tabindex="mergedDisabled ? -1 : 0"
    >
      <IconNode />
      <slot></slot>
    </a>
  </template>
  <Wave v-else-if="!isUnBorderedButtonVariant(mergedColor[1])" component="Button" :disabled="innerLoading">
    <button
      ref="buttonRef"
      v-bind="rest"
      :type="htmlType"
      :class="classes"
      :style="fullStyle"
      :disabled="mergedDisabled"
      @click="handleClick"
    >
      <IconNode />
      <component v-for="(child, index) in contentNode" :is="child" :key="index" />
    </button>
  </Wave>
  <button
    v-else
    ref="buttonRef"
    v-bind="rest"
    :type="htmlType"
    :class="classes"
    :style="fullStyle"
    :disabled="mergedDisabled"
    @click="handleClick"
  >
    <IconNode />
    <component v-for="(child, index) in contentNode" :is="child" :key="index" />
  </button>
</template>
