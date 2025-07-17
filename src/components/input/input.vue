<script lang="tsx" setup>
import { computed, getCurrentInstance, h, useAttrs, watch, type CSSProperties } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import type { InputStatus } from '../_util/statusUtils';
import { useComponentConfig, type Variant } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import { useCompactItemContext } from '../space/CompactContext';
import useStyle, { useSharedStyle } from './style';
import type { InputProps as VcInputProps } from '../../vc-component/input';
import Render from '../render';
import getAllowClear from '../_util/getAllowClear';
import useVariant from '../form/hooks/useVariants';
import { cn } from '@/utils/cn';
import { omit } from 'lodash-es';
import { reactiveComputed } from '@vueuse/core';
import VcInput from '../../vc-component/input';
import ContextIsolator from '../_util/ContextIsolator';

type SemanticName = 'root' | 'prefix' | 'suffix' | 'input' | 'count';

export interface InputProps
  extends Omit<VcInputProps, 'wrapperClassName' | 'groupClassName' | 'inputClassName' | 'affixWrapperClassName' | 'classes'> {
  rootClassName?: string;
  size?: SizeType;
  disabled?: boolean;
  status?: InputStatus;
  variant?: Variant;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  [key: `data-${string}`]: string | undefined;
}

defineOptions({ name: 'Input', inheritAttrs: false });

const props = withDefaults(defineProps<InputProps>(), { variant: 'outlined' });
const attrs = useAttrs();

const bindProps = reactiveComputed(() => ({ ...props, ...attrs }) as InputProps);

const value = defineModel<string | undefined>('value', { default: undefined });

watch(
  () => bindProps.defaultValue,
  (val) => {
    value.value = val;
  },
  { immediate: true },
);

const configContext = useComponentConfig('input');

const prefixCls = configContext.getPrefixCls('input', bindProps.prefixCls);

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useSharedStyle(prefixCls, bindProps.rootClassName);
useStyle(prefixCls, rootCls);

// ===================== Compact Item =====================
const compact = useCompactItemContext(
  prefixCls,
  computed(() => configContext.direction),
);

const mergedSize = computed(() => useSize((ctx) => bindProps.size ?? compact.compactSize ?? ctx));

const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => bindProps.disabled ?? disabled);

const mergedCs = useMergeSemantic(
  computed(() => [configContext.classNames, bindProps.classNames]),
  computed(() => [configContext.styles, bindProps.styles]),
);

const suffixNode = computed(() => {
  return bindProps.suffix && <Render content={bindProps.suffix}></Render>;
});

const mergedAllowClear = computed(() => getAllowClear(bindProps.allowClear ?? configContext.allowClear));

const variant = useVariant('input', bindProps.variant);

const delegatedProps = computed(() => {
  return omit(bindProps, [
    'prefixCls',
    'size',
    'disabled',
    'onBlur',
    'onFocus',
    'suffix',
    'allowClear',
    'addonAfter',
    'addonBefore',
    'class',
    'style',
    'styles',
    'rootClassName',
    'onChange',
    'classNames',
    'variant',
  ]) as any;
});

function handleChange(e) {
  bindProps.onChange?.(e);
}

function handleBlur(e: FocusEvent) {
  bindProps.onBlur?.(e);
}

function handleFocus(e: FocusEvent) {
  bindProps.onFocus?.(e);
}

const vm = getCurrentInstance();
function changeRef(inputInstance) {
  vm.exposed = inputInstance || {};
  vm.exposeProxy = inputInstance || {};
}
</script>
<template>
  <VcInput
    :ref="changeRef"
    :prefix-cls="prefixCls"
    :auto-complete="configContext.autoComplete"
    v-bind="delegatedProps"
    :disabled="mergedDisabled"
    :style="{ ...mergedCs.mergedStyles.root, ...configContext.style, ...bindProps.style }"
    :styles="mergedCs.mergedStyles"
    :suffix="suffixNode"
    :allow-clear="mergedAllowClear"
    v-model:value="value"
    :class="
      cn(
        bindProps.class,
        rootClassName,
        cssVarCls,
        rootCls,
        compact.compactItemClassnames,
        configContext.class,
        mergedCs.mergedClassNames.root,
      )
    "
    :class-names="{
      ...mergedCs.mergedClassNames,
      input: cn(
        {
          [`${prefixCls}-sm`]: mergedSize === 'small',
          [`${prefixCls}-lg`]: mergedSize === 'large',
          [`${prefixCls}-rtl`]: configContext.direction === 'rtl',
        },
        mergedCs.mergedClassNames.input,
        hashId,
      ),
      variant: cn({
        [`${prefixCls}-${variant.variant}`]: variant.enableVariantCls,
      }),
      affixWrapper: cn(
        {
          [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
          [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
          [`${prefixCls}-affix-wrapper-rtl`]: configContext.direction === 'rtl',
        },
        hashId,
      ),
      wrapper: cn(
        {
          [`${prefixCls}-group-rtl`]: configContext.direction === 'rtl',
        },
        hashId,
      ),
      groupWrapper: cn(
        {
          [`${prefixCls}-group-wrapper-sm`]: mergedSize === 'small',
          [`${prefixCls}-group-wrapper-lg`]: mergedSize === 'large',
          [`${prefixCls}-group-wrapper-rtl`]: configContext.direction === 'rtl',
          [`${prefixCls}-group-wrapper-${variant.variant}`]: variant.enableVariantCls,
        },
        hashId,
      ),
    }"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    :addon-before="
      bindProps.addonBefore && h(ContextIsolator, { space: true }, { default: () => h(Render, { content: addonBefore }) })
    "
    :addon-after="
      bindProps.addonAfter && h(ContextIsolator, { space: true }, { default: () => h(Render, { content: addonAfter }) })
    "
  />
</template>
