<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import classNames from 'classnames';
import { omit } from 'lodash-es';
import { computed, nextTick, ref, toRefs, useSlots, useTemplateRef, watch } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import isValidNode from '../_util/isValidNode';
import { Wave } from '../_util/wave';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/CompactContext';
import {
  isUnBorderedButtonVariant,
  spaceChildren,
  type BaseButtonProps,
  type ButtonColorType,
  type ButtonProps,
  type ButtonType,
  type ButtonVariantType,
} from './buttonHelpers';
import IconNode from './IconNode.vue';
import useStyle from './style';
import Compact from './style/compact';

type ColorVariantPairType = [color?: ButtonColorType, variant?: ButtonVariantType];
type LoadingConfigType = {
  loading: boolean;
  delay: number;
};

defineOptions({ name: 'Button', inheritAttrs: false });

const {
  _skipSemantic,
  loading = false,
  prefixCls: customizePrefixCls,
  color,
  variant,
  type = 'default',
  danger = false,
  shape = 'default',
  size: customizeSize,
  disabled: customDisabled,
  class: className,
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
  onClick,
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

const slotVNodes = computed(() => slots.default?.() || []);

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
  if (button?.value?.color && button?.value?.variant) {
    return [button?.value.color, button?.value.variant];
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

const config = useComponentConfig('button');

const needInserted = computed(() => slotVNodes.value.length === 1 && !icon && !isUnBorderedButtonVariant(mergedColor.value[1]));

const mergedInsertSpace = computed(() => autoInsertSpace ?? config.autoInsertSpace ?? true);

const prefixCls = config.getPrefixCls('btn', customizePrefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls);

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

const mergedCs = useMergeSemantic(
  computed(() => [_skipSemantic ? undefined : config.classNames, buttonClassNames]),
  computed(() => [_skipSemantic ? undefined : config.styles, styles]),
);

const compact = useCompactItemContext(
  prefixCls,
  computed(() => config.direction),
);

const sizeClassNameMap = { large: 'lg', small: 'sm', middle: undefined };

const sizeFullName = computed(() => useSize((ctxSize) => customizeSize ?? compact.compactSize ?? ctxSize));

const sizeCls = computed(() => (sizeFullName?.value ? (sizeClassNameMap[sizeFullName?.value] ?? '') : ''));

const iconType = computed(() => (innerLoading?.value ? 'loading' : icon));

const linkButtonRestProps = computed(() => omit(rest as ButtonProps));

const classes = computed(() => {
  return classNames(
    prefixCls,
    hashId,
    cssVarCls,
    {
      [`${prefixCls}-${shape}`]: shape !== 'default' && shape !== 'square' && shape,
      [`${prefixCls}-${mergedType?.value}`]: mergedType?.value,
      [`${prefixCls}-dangerous`]: danger,

      [`${prefixCls}-color-${mergedColorText?.value}`]: mergedColorText?.value,
      [`${prefixCls}-variant-${mergedColor?.value[1]}`]: mergedColor?.value[1],
      [`${prefixCls}-${sizeCls?.value}`]: sizeCls?.value,
      [`${prefixCls}-icon-only`]: !slotVNodes.value && slotVNodes.value.length !== 0 && !!iconType?.value,
      [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonVariant(mergedColor?.value[1]),
      [`${prefixCls}-loading`]: innerLoading.value,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar?.value && mergedInsertSpace.value && !innerLoading?.value,
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-rtl`]: config.direction === 'rtl',
      [`${prefixCls}-icon-end`]: iconPosition === 'end',
    },
    compact.compactItemClassnames,
    className,
    rootClassName,
    config.class,
    mergedCs.mergedClassNames?.root,
  );
});

const fullStyle = computed(() => ({
  ...mergedCs.mergedStyles?.root,
  ...config.style,
  ...(customStyle as Record<string, string>),
}));

const iconSharedProps = computed(() => ({
  class: mergedCs.mergedClassNames.icon,
  style: mergedCs.mergedStyles.icon,
}));

const handleClick = (e: MouseEvent) => {
  if (innerLoading.value || mergedDisabled.value) {
    e.preventDefault();
    return;
  }
  onClick?.(e);
};

const contentNode = computed(() =>
  isValidNode(slotVNodes.value)
    ? spaceChildren(
        slotVNodes.value,
        needInserted.value && mergedInsertSpace.value,
        mergedCs.mergedStyles.content,
        mergedCs.mergedClassNames.content,
      )
    : null,
);
</script>
<template>
  <a
    v-if="linkButtonRestProps.href !== undefined"
    ref="buttonRef"
    v-bind="{ ...linkButtonRestProps }"
    :class="cn(classes, { [`${prefixCls}-disabled`]: mergedDisabled })"
    :href="mergedDisabled ? undefined : linkButtonRestProps.href"
    :style="fullStyle"
    @click="handleClick"
    :tabindex="mergedDisabled ? -1 : 0"
  >
    <IconNode :prefix-cls="prefixCls" :icon="icon" :inner-loading="innerLoading" :icon-shared-props="iconSharedProps" />
    <slot></slot>
  </a>
  <Wave v-else-if="!isUnBorderedButtonVariant(mergedColor[1])" component="Button" :disabled="innerLoading">
    <button
      ref="buttonRef"
      v-bind="{ ...rest }"
      :type="htmlType"
      :class="classes"
      :style="fullStyle"
      :disabled="mergedDisabled"
      @click="handleClick"
    >
      <IconNode :prefix-cls="prefixCls" :icon="icon" :inner-loading="innerLoading" :icon-shared-props="iconSharedProps" />
      <component v-for="(child, index) in contentNode" :is="child" :key="index" />
      <Compact v-if="compact.compactItemClassnames" :prefix-cls="prefixCls" />
    </button>
  </Wave>
  <button
    v-else
    ref="buttonRef"
    v-bind="{ ...rest }"
    :type="htmlType"
    :class="classes"
    :style="fullStyle"
    :disabled="mergedDisabled"
    @click="handleClick"
  >
    <IconNode :prefix-cls="prefixCls" :icon="icon" :inner-loading="innerLoading" :icon-shared-props="iconSharedProps" />
    <component v-for="(child, index) in contentNode" :is="child" :key="index" />
    <Compact v-if="compact.compactItemClassnames" :prefix-cls="prefixCls" />
  </button>
</template>
