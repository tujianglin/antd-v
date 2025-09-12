<script lang="tsx" setup>
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRefs, useAttrs, watch } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import isValidNode from '../_util/isValidNode';
import { useComposeRef } from '../_util/type';
import { Wave } from '../_util/wave';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/CompactContext';
import { ButtonTypeMap, getLoadingConfig, isUnBorderedButtonVariant, spaceChildren } from './buttonHelpers';
import type { ButtonProps, ButtonSlots, ColorVariantPairType, LoadingConfigType } from './interface';
import useStyle from './style';
import Compact from './style/compact';
import IconWrapper from './IconWrapper.vue';
import DefaultLoadingIcon from './DefaultLoadingIcon.vue';
import Render from '../render/render';

defineOptions({ name: 'Button', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  _skipSemantic,
  loading = false,
  prefixCls: customizePrefixCls,
  color,
  variant,
  type = 'default',
  danger = false,
  shape: customizeShape,
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
  autofocus = false,
  onClick,
  ...rest
} = defineProps<ButtonProps>();

// Slots
const slots = defineSlots<ButtonSlots>();
const iconSlot = computed(() => slots.icon || icon);
const defaultSlot = computed(() => slots.default?.() || []);

const { button } = toRefs(useConfigContextInject());

const shape = computed(() => customizeShape || button?.value?.shape || 'default');

const parsed = computed((): ColorVariantPairType => {
  // >>>>> Local
  // Color & Variant
  if (color && variant) {
    return [color, variant];
  }

  // Sugar syntax
  if (type || danger) {
    const colorVariantPair = ButtonTypeMap[type] || [];
    if (danger) {
      return ['danger', colorVariantPair[1]];
    }
    return colorVariantPair;
  }

  // >>> Context fallback
  if (button.value?.color && button.value?.variant) {
    return [button.value.color, button.value.variant];
  }

  return ['default', 'outlined'];
});
const parsedColor = computed(() => parsed.value[0]);
const parsedVariant = computed(() => parsed.value[1]);

const merged = computed((): ColorVariantPairType => {
  if (ghost && parsedVariant.value === 'solid') {
    return [parsedColor.value, 'outlined'];
  }
  return [parsedColor.value, parsedVariant.value];
});
const mergedColor = computed(() => merged.value[0]);
const mergedVariant = computed(() => merged.value[1]);

const isDanger = computed(() => mergedColor.value === 'danger');
const mergedColorText = computed(() => (isDanger.value ? 'dangerous' : mergedColor.value));

const {
  getPrefixCls,
  direction,
  autoInsertSpace: contextAutoInsertSpace,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('button'));

const mergedInsertSpace = computed(() => autoInsertSpace ?? contextAutoInsertSpace.value ?? true);

const prefixCls = computed(() => getPrefixCls.value('btn', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const loadingOrDelay = computed((): LoadingConfigType => getLoadingConfig(loading));

const innerLoading = ref(false);
watch(
  loadingOrDelay,
  (val) => {
    innerLoading.value = val.loading;
  },
  { immediate: true, deep: true },
);

const hasTwoCNChar = ref(false);

const buttonRef = ref<HTMLButtonElement | HTMLAnchorElement>(null);

const needInserted = computed(
  () => defaultSlot.value.length === 1 && !iconSlot.value && !isUnBorderedButtonVariant(mergedVariant.value),
);

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [_skipSemantic ? undefined : contextClassNames.value, buttonClassNames]),
  computed(() => [_skipSemantic ? undefined : contextStyles.value, styles]),
);

// ========================= Mount ==========================
// Record for mount status.
// This will help to no to show the animation of loading on the first mount.
const isMountRef = ref(true);
onMounted(() => {
  isMountRef.value = false;
});

onBeforeUnmount(() => {
  isMountRef.value = true;
});

watch(
  () => autofocus,
  async (val) => {
    await nextTick();
    if (val) {
      buttonRef.value?.focus();
    }
  },
  { immediate: true },
);

const handleClick = (e) => {
  if (innerLoading.value || mergedDisabled.value) {
    e.preventDefault();
    return;
  }
  onClick?.(e);
};

// ========================== Size ==========================
const { compactSize, compactItemClassnames } = toRefs(useCompactItemContext(prefixCls, direction));

const sizeClassNameMap = { large: 'lg', small: 'sm', middle: undefined };

const sizeFullName = useSize(computed(() => (ctxSize) => customizeSize ?? compactSize.value ?? ctxSize));

const sizeCls = computed(() => (sizeFullName.value ? (sizeClassNameMap[sizeFullName.value] ?? '') : ''));

const iconType = computed(() => (innerLoading.value ? 'loading' : iconSlot.value));

const linkButtonRestProps = computed(() => omit(rest as ButtonProps & { navigate: any }, ['navigate']));

const classes = computed(() => {
  return clsx(
    prefixCls.value,
    hashId.value,
    cssVarCls.value,
    {
      [`${prefixCls.value}-${shape.value}`]: shape.value !== 'default' && shape.value !== 'square' && shape.value,
      // Compatible with versions earlier than 5.21.0
      [`${prefixCls.value}-${type}`]: type,
      [`${prefixCls.value}-dangerous`]: danger,

      [`${prefixCls.value}-color-${mergedColorText.value}`]: mergedColorText.value,
      [`${prefixCls.value}-variant-${mergedVariant.value}`]: mergedVariant.value,
      [`${prefixCls.value}-${sizeCls.value}`]: sizeCls.value,
      [`${prefixCls.value}-icon-only`]: !defaultSlot.value && defaultSlot.value.length !== 0 && !!iconType?.value,
      [`${prefixCls.value}-background-ghost`]: ghost && !isUnBorderedButtonVariant(mergedVariant.value),
      [`${prefixCls.value}-loading`]: innerLoading.value,
      [`${prefixCls.value}-two-chinese-chars`]: hasTwoCNChar?.value && mergedInsertSpace.value && !innerLoading?.value,
      [`${prefixCls.value}-block`]: block,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-icon-end`]: iconPosition === 'end',
    },
    compactItemClassnames?.value,
    className,
    rootClassName,
    contextClassName?.value,
    mergedClassNames?.value?.root,
  );
});

const fullStyle = computed(() => ({
  ...mergedStyles.value?.root,
  ...contextStyle?.value,
  ...(customStyle as Record<string, string>),
}));

const iconSharedProps = computed(() => ({
  class: mergedClassNames?.value?.icon,
  style: mergedStyles?.value?.icon,
}));

const mergedRef = useComposeRef();

const iconNode = () => {
  return iconSlot.value && !innerLoading.value ? (
    <IconWrapper prefixCls={prefixCls.value} {...iconSharedProps}>
      <Render content={iconSlot.value}></Render>
    </IconWrapper>
  ) : loading && typeof loading === 'object' && loading.icon ? (
    <IconWrapper prefixCls={prefixCls.value} {...iconSharedProps}>
      <Render content={loading.icon}></Render>
    </IconWrapper>
  ) : (
    <DefaultLoadingIcon
      existIcon={!!iconSlot.value}
      prefixCls={prefixCls.value}
      loading={innerLoading.value}
      mount={isMountRef.value}
      {...iconSharedProps}
    />
  );
};

const contentNode = () => {
  return isValidNode(defaultSlot.value)
    ? spaceChildren(
        defaultSlot.value,
        needInserted.value && mergedInsertSpace.value,
        mergedStyles.value.content,
        mergedClassNames.value.content,
      )
    : null;
};
const attrs = useAttrs();
const buttonNode = () => {
  return (
    <button
      {...rest}
      {...attrs}
      type={htmlType}
      class={classes.value}
      style={fullStyle.value}
      onClick={handleClick}
      disabled={mergedDisabled.value}
      ref={mergedRef}
    >
      <Render content={iconNode}></Render>
      <Render content={contentNode}></Render>
      {compactItemClassnames.value && <Compact prefixCls={prefixCls.value}></Compact>}
    </button>
  );
};
</script>
<template>
  <a
    v-if="linkButtonRestProps.href !== undefined"
    :ref="mergedRef"
    v-bind="{ ...linkButtonRestProps, ...$attrs }"
    :class="clsx(classes, { [`${prefixCls}-disabled`]: mergedDisabled })"
    :href="mergedDisabled ? undefined : linkButtonRestProps.href"
    :style="fullStyle"
    @click="handleClick"
    :tabindex="mergedDisabled ? -1 : 0"
  >
    <Render :content="iconNode" />
    <Render :content="contentNode" />
  </a>
  <Wave v-else-if="!isUnBorderedButtonVariant(mergedVariant)" component="Button" :disabled="innerLoading">
    <Render :content="buttonNode" />
  </Wave>
  <Render v-else :content="buttonNode" />
</template>
