<script lang="tsx" setup>
import { computed, getCurrentInstance, h, toRefs, type ComponentInstance, type VNode } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import type { InputNumberClassNamesType, InputNumberProps, InputNumberStylesType } from './interface';
import { useMergeSemantic } from '../_util/hooks';
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
import { useFormItemInputContextInject } from '../form/context';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';

defineOptions({ name: 'InputNumber', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  rootClassName,
  size: customizeSize,
  disabled: customDisabled = undefined,
  prefixCls: customizePrefixCls,
  addonBefore: customAddonBefore,
  addonAfter: customAddonAfter,
  prefix: customPrefix,
  suffix: customSuffix,
  readonly = false,
  status: customStatus,
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

const addonBefore = computed(() => slots.addonBefore || customAddonBefore);
const addonAfter = computed(() => slots.addonAfter || customAddonAfter);
const prefix = computed(() => slots.prefix || customPrefix);
const suffix = computed(() => slots.suffix || customSuffix);

const value = defineModel<ValueType>('value');

const {
  direction,
  getPrefixCls,
  class: contextClassName,
  style: contextStyle,
  styles: contextStyles,
  classNames: contextClassNames,
} = toRefs(useComponentConfig('inputNumber'));

const prefixCls = computed(() => getPrefixCls.value('input-number', customizePrefixCls));

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

const { hasFeedback, status: contextStatus, isFormItemInput, feedbackIcon } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));

const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize.value ?? ctx));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<InputNumberClassNamesType, InputNumberStylesType, InputNumberProps>(
  computed(() => [contextClassNames.value, classNames]),
  computed(() => [contextStyles.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
      disabled: mergedDisabled.value,
    },
  })),
);

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

const [variant, enableVariantCls] = useVariant(
  'inputNumber',
  computed(() => customVariant),
);

const suffixNode = computed(() => hasFeedback?.value && <Render content={feedbackIcon?.value}></Render>);

const inputNumberClass = computed(() => {
  return clsx(
    {
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-in-form-item`]: isFormItemInput?.value,
    },
    hashId.value,
    mergedClassNames.value?.input,
  );
});
const wrapperClassName = `${prefixCls.value}-group`;

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
    :prefix="prefix"
    :suffix="suffixNode || suffix"
    :addon-before="addonBefore && h(ContextIsolator, { space: true }, () => [h(Render, { content: addonBefore })])"
    :addon-after="addonAfter && h(ContextIsolator, { space: true }, () => [h(Render, { content: addonAfter })])"
    :class-names="{
      ...mergedClassNames,
      input: inputNumberClass,
      variant: clsx(
        {
          [`${prefixCls}-${variant}`]: enableVariantCls,
        },
        getStatusClassNames(prefixCls, mergedStatus, hasFeedback),
      ),
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
        getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback),
        hashId,
        hashId,
      ),
    }"
    :styles="mergedStyles"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
  />
</template>
