<script lang="tsx" setup>
import { computed, h, toRefs, type VNode } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/CompactContext';
import useStyle, { useSharedStyle } from './style';
import Render from '../render';
import getAllowClear from '../_util/getAllowClear';
import useVariant from '../form/hooks/useVariants';
import clsx from 'clsx';
import VcInput from '../../vc-component/input';
import ContextIsolator from '../_util/ContextIsolator';
import type { InputProps } from './interface';
import { useComposeRef } from '../_util/type';

type Slots = {
  addonBefore?: () => VNode[];
  addonAfter?: () => VNode[];
  suffix?: () => VNode[];
};

defineOptions({ name: 'Input', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  size: customSize,
  disabled: customDisabled,
  onBlur,
  onFocus,
  suffix,
  allowClear,
  addonAfter,
  addonBefore,
  class: className,
  style,
  styles,
  rootClassName,
  onChange,
  classNames,
  variant: customVariant,
  ...rest
} = defineProps<InputProps>();
const slots = defineSlots<Slots>();

const value = defineModel<string>('value');

// Slots
const addonBeforeSlot = computed(() => slots.addonBefore || addonBefore);
const addonAfterSlot = computed(() => slots.addonAfter || addonAfter);
const suffixSlot = computed(() => slots.suffix || suffix);

const {
  getPrefixCls,
  direction,
  allowClear: contextAllowClear,
  autoComplete: contextAutoComplete,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('input'));

const prefixCls = getPrefixCls.value('input', customizePrefixCls);

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useSharedStyle(prefixCls, rootClassName);
useStyle(prefixCls, rootCls);

// ===================== Compact Item =====================
const { compactSize, compactItemClassnames } = toRefs(
  useCompactItemContext(
    prefixCls,
    computed(() => direction.value),
  ),
);

const mergedSize = computed(() => useSize((ctx) => customSize ?? compactSize.value ?? ctx));

const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const { mergedClassNames, mergedStyles } = toRefs(
  useMergeSemantic(
    computed(() => [contextClassNames.value, classNames]),
    computed(() => [contextStyles.value, styles]),
  ),
);

const suffixNode = computed(() => {
  return suffixSlot.value && <Render content={suffixSlot.value}></Render>;
});

const mergedAllowClear = computed(() => getAllowClear((contextAllowClear?.value as any) ?? allowClear));

const { variant, enableVariantCls } = toRefs(
  useVariant(
    'input',
    computed(() => customVariant),
  ),
);
function handleChange(e) {
  onChange?.(e);
}

function handleBlur(e: FocusEvent) {
  onBlur?.(e);
}

function handleFocus(e: FocusEvent) {
  onFocus?.(e);
}

const mergedRef = useComposeRef();
</script>
<template>
  <VcInput
    :ref="mergedRef"
    :prefix-cls="prefixCls"
    :auto-complete="contextAutoComplete"
    v-bind="{ ...rest, ...$attrs }"
    :disabled="mergedDisabled"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    :styles="mergedStyles"
    :suffix="suffixNode"
    :allow-clear="mergedAllowClear"
    v-model:value="value"
    :class="clsx(className, rootClassName, cssVarCls, rootCls, compactItemClassnames, contextClassName, mergedClassNames.root)"
    :class-names="{
      ...mergedClassNames,
      input: clsx(
        {
          [`${prefixCls}-sm`]: mergedSize === 'small',
          [`${prefixCls}-lg`]: mergedSize === 'large',
          [`${prefixCls}-rtl`]: direction === 'rtl',
        },
        mergedClassNames.input,
        hashId,
      ),
      variant: clsx({
        [`${prefixCls}-${variant}`]: enableVariantCls,
      }),
      affixWrapper: clsx(
        {
          [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
          [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
          [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl',
        },
        hashId,
      ),
      wrapper: clsx(
        {
          [`${prefixCls}-group-rtl`]: direction === 'rtl',
        },
        hashId,
      ),
      groupWrapper: clsx(
        {
          [`${prefixCls}-group-wrapper-sm`]: mergedSize === 'small',
          [`${prefixCls}-group-wrapper-lg`]: mergedSize === 'large',
          [`${prefixCls}-group-wrapper-rtl`]: direction === 'rtl',
          [`${prefixCls}-group-wrapper-${variant}`]: enableVariantCls,
        },
        hashId,
      ),
    }"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    :addon-before="
      addonBeforeSlot && h(ContextIsolator, { space: true }, { default: () => h(Render, { content: addonBeforeSlot }) })
    "
    :addon-after="
      addonAfterSlot && h(ContextIsolator, { space: true }, { default: () => h(Render, { content: addonAfterSlot }) })
    "
  />
</template>
