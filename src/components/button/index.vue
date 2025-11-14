<script lang="tsx" setup>
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  toRefs,
  useAttrs,
  watch,
  watchEffect,
  type VNode,
} from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import { Wave } from '../_util/wave';
import { useConfigContextInject } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/CompactContext';
import { ButtonTypeMap, getLoadingConfig, isTwoCNChar, isUnBorderedButtonVariant, spaceChildren } from './buttonHelpers';
import type {
  BaseButtonProps,
  ButtonClassNamesType,
  ButtonProps,
  ButtonStylesType,
  ColorVariantPairType,
  LoadingConfigType,
} from './interface';
import useStyle from './style';
import Compact from './style/compact';
import IconWrapper from './IconWrapper.vue';
import DefaultLoadingIcon from './DefaultLoadingIcon.vue';
import Render from '@/vc-component/render';
import { isValidElement, isValidNode } from '@/vc-util/Children/util';
import { useComposeRef } from '@/vc-util/ref';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';

defineOptions({ name: 'Button', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  _skipSemantic,
  loading = undefined,
  prefixCls: customizePrefixCls,
  color,
  variant,
  type = 'default',
  danger = undefined,
  shape: customizeShape,
  size: customizeSize,
  disabled: customDisabled = undefined,
  class: className,
  rootClassName,
  icon: customIcon,
  iconPosition = 'start',
  ghost = undefined,
  block = undefined,
  htmlType = 'button',
  classNames: buttonClassNames,
  styles,
  style: customStyle = {},
  autoInsertSpace = undefined,
  autofocus = undefined,
  ...rest
} = defineProps<ButtonProps>();

const emits = defineEmits<{
  click?: [e: MouseEvent];
}>();

// Slots
const slots = defineSlots<{
  icon?: () => VNode[];
  default?: () => VNode[];
}>();

const icon = computed(() => slots.icon || customIcon);
const children = computed(() => flattenChildren(slots.default?.()) || []);

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

const mergedInsertSpace = computed(() => autoInsertSpace ?? contextAutoInsertSpace?.value ?? true);

const prefixCls = computed(() => getPrefixCls.value('btn', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const loadingOrDelay = computed((): LoadingConfigType => getLoadingConfig(loading));

const innerLoading = ref(false);

const hasTwoCNChar = ref(false);

const buttonRef = ref<HTMLButtonElement | HTMLAnchorElement>(null);

const needInserted = computed(
  () => children.value.length === 1 && !icon.value && !isUnBorderedButtonVariant(mergedVariant.value),
);

// ========================= Mount ==========================
// Record for mount status.
// This will help to no to show the animation of loading on the first mount.
const isMountRef = ref(true);

let delayTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  loadingOrDelay,
  (val) => {
    if (val.delay > 0) {
      delayTimer = setTimeout(() => {
        delayTimer = null;
        innerLoading.value = true;
      }, val.delay);
    } else {
      innerLoading.value = val.loading;
    }
  },
  { immediate: true, deep: true },
);

// Two chinese characters check
watchEffect(() => {
  // FIXME: for HOC usage like <FormatMessage />
  if (!buttonRef.value || !mergedInsertSpace.value) {
    return;
  }
  const buttonText = buttonRef.value.textContent.trim() || '';
  if (needInserted.value && isTwoCNChar(buttonText)) {
    if (!hasTwoCNChar.value) {
      hasTwoCNChar.value = true;
    }
  } else if (hasTwoCNChar.value) {
    hasTwoCNChar.value = false;
  }
});

onMounted(() => {
  isMountRef.value = false;
  if (autofocus && buttonRef.value) {
    buttonRef.value?.focus();
  }
});

onBeforeUnmount(() => {
  isMountRef.value = true;
  if (delayTimer) {
    clearTimeout(delayTimer);
    delayTimer = null;
  }
});

const handleClick = (e) => {
  if (innerLoading.value || mergedDisabled.value) {
    e.preventDefault();
    return;
  }
  emits?.('click', e);
};

// ========================== Size ==========================
const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

const sizeClassNameMap = { large: 'lg', small: 'sm', middle: undefined };

const sizeFullName = useSize(computed(() => (ctxSize) => customizeSize ?? compactSize.value ?? ctxSize));

const sizeCls = computed(() => (sizeFullName.value ? (sizeClassNameMap[sizeFullName.value] ?? '') : ''));

const iconType = computed(() => (innerLoading.value ? 'loading' : icon.value));

const linkButtonRestProps = computed(() => omit(rest as ButtonProps & { navigate: any }, ['navigate']));

// =========== Merged Props for Semantic ===========
const vm = getCurrentInstance();
const mergedProps = computed<BaseButtonProps>(() => {
  return {
    ...vm.props,
    color: mergedColor.value,
    variant: mergedVariant.value,
    danger: isDanger.value,
    shape: shape.value,
    size: sizeFullName.value,
    disabled: mergedDisabled.value,
    loading: innerLoading.value,
  };
});

const [mergedClassNames, mergedStyles] = useMergeSemantic<ButtonClassNamesType, ButtonStylesType, BaseButtonProps>(
  computed(() => [_skipSemantic ? undefined : contextClassNames.value, buttonClassNames]),
  computed(() => [_skipSemantic ? undefined : contextStyles.value, styles]),
  computed(() => ({
    props: mergedProps.value,
  })),
);

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
      [`${prefixCls.value}-icon-only`]: !isValidElement(children.value) && children.value.length === 0 && !!iconType?.value,
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

const mergedRef = useComposeRef({}, buttonRef);

const iconNode = () => {
  return icon.value && !innerLoading.value ? (
    <IconWrapper prefixCls={prefixCls.value} {...iconSharedProps.value}>
      <Render content={icon.value}></Render>
    </IconWrapper>
  ) : loading && typeof loading === 'object' && loading.icon ? (
    <IconWrapper prefixCls={prefixCls.value} {...iconSharedProps.value}>
      <Render content={loading.icon}></Render>
    </IconWrapper>
  ) : (
    <DefaultLoadingIcon
      existIcon={!!icon.value}
      prefixCls={prefixCls.value}
      loading={innerLoading.value}
      mount={isMountRef.value}
      {...iconSharedProps.value}
    />
  );
};

const contentNode = () => {
  return isValidNode(children.value)
    ? spaceChildren(
        children.value,
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
