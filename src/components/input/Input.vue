<script lang="tsx" setup>
import { computed, getCurrentInstance, h, toRefs, type ComponentInstance, type VNode } from 'vue';
import { useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import { useCompactItemContext } from '../space/CompactContext';
import useStyle, { useSharedStyle } from './style';
import Render from '@/vc-component/render';
import getAllowClear from '../_util/getAllowClear';
import useVariant from '../form/hooks/useVariants';
import clsx from 'clsx';
import RcInput from '@/vc-component/input';
import ContextIsolator from '../_util/ContextIsolator';
import type { InputClassNamesType, InputProps, InputStylesType } from './interface';
import type { ValueType } from '@/vc-component/input/interface';
import { useFormItemInputContextInject } from '../form/context';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';

defineOptions({ name: 'Input', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  status: customStatus,
  size: customSize,
  disabled: customDisabled = undefined,
  suffix,
  allowClear = undefined,
  addonAfter,
  addonBefore,
  class: className,
  style,
  styles,
  rootClassName,
  classNames,
  variant: customVariant,
  ...rest
} = defineProps<InputProps>();

const emits = defineEmits<{
  blur: [FocusEvent];
  focus: [FocusEvent];
  change: [any];
}>();

const slots = defineSlots<{
  addonBefore?: () => VNode[];
  addonAfter?: () => VNode[];
  suffix?: () => VNode[];
}>();

const value = defineModel<ValueType>('value');

// Slots
const addonBeforeSlot = computed(() => slots.addonBefore || addonBefore);
const addonAfterSlot = computed(() => slots.addonAfter || addonAfter);
const suffixSlot = computed(() => slots.suffix || suffix);

const {
  getPrefixCls,
  direction,
  allowClear: contextAllowClear,
  autocomplete: contextAutoComplete,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('input'));

const prefixCls = computed(() => getPrefixCls.value('input', customizePrefixCls));

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useSharedStyle(
  prefixCls,
  computed(() => rootClassName),
);
useStyle(prefixCls, rootCls);

// ===================== Compact Item =====================
const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

const mergedSize = useSize(computed(() => (ctx) => customSize ?? compactSize.value ?? ctx));

const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

// =========== Merged Props for Semantic ==========
const vm = getCurrentInstance();
const mergedProps = computed(() => {
  return {
    ...vm.props,
    size: mergedSize.value,
    disabled: mergedDisabled.value,
  } as InputProps;
});

const [mergedClassNames, mergedStyles] = useMergeSemantic<InputClassNamesType, InputStylesType, InputProps>(
  computed(() => [contextClassNames.value, classNames]),
  computed(() => [contextStyles.value, styles]),
  computed(() => ({ props: mergedProps.value })),
);

// ===================== Status =====================
const { status: contextStatus, hasFeedback, feedbackIcon } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));

const suffixNode = computed(() => {
  if (hasFeedback?.value || suffixSlot?.value) {
    return (
      <>
        <Render content={suffixSlot.value}></Render>
        {hasFeedback?.value && <Render content={feedbackIcon.value}></Render>}
      </>
    );
  }
  return suffixSlot.value && <Render content={suffixSlot.value}></Render>;
});

const mergedAllowClear = computed(() => getAllowClear((contextAllowClear?.value as any) ?? allowClear));

const [variant, enableVariantCls] = useVariant(
  'input',
  computed(() => customVariant),
);
function handleChange(e) {
  emits('change', e);
}

function handleBlur(e: FocusEvent) {
  emits('blur', e);
}

function handleFocus(e: FocusEvent) {
  emits('focus', e);
}

function changeRef(el) {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
}

defineExpose({} as ComponentInstance<typeof RcInput>);
</script>
<template>
  <RcInput
    :ref="changeRef"
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
      variant: clsx(
        {
          [`${prefixCls}-${variant}`]: enableVariantCls,
        },
        getStatusClassNames(prefixCls, mergedStatus),
      ),
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
        getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback),
        hashId,
      ),
    }"
    @input="handleChange"
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
