<script lang="tsx" setup>
import { computed, getCurrentInstance, h, toRefs, type ComponentInstance, type VNode } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import type { InputNumberProps } from './interface';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import { useCompactItemContext } from '../space/CompactContext';
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { reactiveComputed } from '@vueuse/core';
import useSize from '../config-provider/hooks/useSize';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useVariant from '../form/hooks/useVariants';
import clsx from 'clsx';
import RcInputNumber from '@/vc-component/input-number';
import ContextIsolator from '../_util/ContextIsolator';
import Render from '@/vc-component/render';
import type { ValueType } from '@/vc-component/mini-decimal';

defineOptions({ name: 'InputNumber', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rootClassName,
  size: customizeSize,
  disabled: customDisabled,
  prefixCls: customizePrefixCls,
  addonBefore,
  addonAfter,
  prefix,
  suffix,
  readonly = false,
  controls = true,
  variant: customVariant,
  class: className,
  style,
  classNames,
  styles,
  changeOnBlur = true,
  keyboard = true,
  ...others
} = defineProps<InputNumberProps>();

const slots = defineSlots<{
  addonBefore?: () => VNode[];
  addonAfter?: () => VNode[];
  prefix?: () => VNode[];
  suffix?: () => VNode[];
}>();

const addonBeforeSlot = computed(() => slots.addonBefore || addonBefore);
const addonAfterSlot = computed(() => slots.addonAfter || addonAfter);
const prefixSlot = computed(() => slots.prefix || prefix);
const suffixSlot = computed(() => slots.suffix || suffix);

const value = defineModel<ValueType>('value');

const {
  direction,
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  styles: contextStyles,
  classNames: contextClassNames,
} = toRefs(useComponentConfig('inputNumber'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames.value, classNames]),
  computed(() => [contextStyles.value, styles]),
);

const prefixCls = computed(() => getPrefixCls.value('input-number', customizePrefixCls));

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);
const controlsTemp = computed(() => (typeof controls === 'boolean' ? controls : undefined));

const { upIcon, downIcon } = toRefs(
  reactiveComputed(() => {
    let upIcon = <UpOutlined class={`${prefixCls.value}-handler-up-inner`} />;
    let downIcon = <DownOutlined class={`${prefixCls.value}-handler-down-inner`} />;
    if (typeof controls === 'object') {
      upIcon =
        typeof controls.upIcon === 'undefined' ? (
          upIcon
        ) : (
          <span class={`${prefixCls.value}-handler-up-inner`}>{controls.upIcon}</span>
        );
      downIcon =
        typeof controls.downIcon === 'undefined' ? (
          downIcon
        ) : (
          <span class={`${prefixCls.value}-handler-down-inner`}>{controls.downIcon}</span>
        );
    }
    return { upIcon, downIcon };
  }),
);

const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize.value ?? ctx));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const [variant, enableVariantCls] = useVariant(
  'inputNumber',
  computed(() => customVariant),
);

const inputNumberClass = computed(() => {
  return clsx(
    {
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    hashId.value,
    mergedClassNames.value?.input,
  );
});
const wrapperClassName = `${prefixCls.value}-group`;

const vm = getCurrentInstance();
function changeRef(el) {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
}

defineExpose({} as ComponentInstance<typeof RcInputNumber>);
</script>
<template>
  <RcInputNumber
    v-bind="{ ...others, ...$attrs }"
    :keyboard="keyboard"
    :ref="changeRef"
    v-model:value="value"
    :disabled="mergedDisabled"
    :change-on-blur="changeOnBlur"
    :class="clsx(cssVarCls, rootCls, className, rootClassName, mergedClassNames.root, contextClassName, compactItemClassnames)"
    :up-handler="upIcon"
    :down-handler="downIcon"
    :prefix-cls="prefixCls"
    :readonly="readonly"
    :controls="controlsTemp"
    :prefix="prefixSlot"
    :suffix="suffixSlot"
    :addon-before="
      addonBeforeSlot && h(ContextIsolator, { space: true }, { default: () => h(Render, { content: addonBeforeSlot }) })
    "
    :addon-after="
      addonAfterSlot && h(ContextIsolator, { space: true }, { default: () => h(Render, { content: addonAfterSlot }) })
    "
    :class-names="{
      ...mergedClassNames,
      input: inputNumberClass,
      variant: clsx({
        [`${prefixCls}-${variant}`]: enableVariantCls,
      }),
      affixWrapper: clsx(
        {
          [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
          [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
          [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl',
          [`${prefixCls}-affix-wrapper-without-controls`]: controls === false || mergedDisabled || readonly,
        },
        hashId,
      ),
      wrapper: clsx(
        {
          [`${wrapperClassName}-rtl`]: direction === 'rtl',
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
    :styles="mergedStyles"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
  />
</template>
