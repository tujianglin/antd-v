<script lang="tsx" setup>
import { computed, getCurrentInstance, h, toRefs, useTemplateRef } from 'vue';
import useMergedPickerSemantic from './hooks/useMergedPickerSemantic';
import { useConfigContextInject } from '../config-provider';
import { useCompactItemContext } from '../space/CompactContext';
import useVariant from '../form/hooks/useVariants';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import clsx from 'clsx';
import { getRangePlaceholder, useIcons } from './util';
import useComponents from './generatePicker/useComponents';
import useSize from '../config-provider/hooks/useSize';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { useFormItemInputContextInject } from '../form/context';
import { useLocale } from '../locale';
import enUS from './locale/en_US';
import { useZIndex } from '../_util/hooks/useZIndex';
import ContextIsolator from '../_util/ContextIsolator';
import { RangePicker as RCRangePicker } from '@/vc-component/picker';
import type { GenerateConfig } from '@/vc-component/picker/generate';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { TIME } from './generatePicker/constant';
import SuffixIcon from './generatePicker/SuffixIcon.vue';
import { SwapRightOutlined } from '@ant-design/icons-vue';
import type { RangePickerProps } from './interface';
import dayjs from 'dayjs';
import type { DateType } from '@/vc-util/type';

const {
  prefixCls: customizePrefixCls,
  getPopupContainer: customGetPopupContainer,
  components,
  class: className,
  style,
  classNames,
  styles,
  placement,
  size: customizeSize,
  disabled: customDisabled = undefined,
  placeholder,
  status: customStatus,
  variant: customVariant,
  picker,
  rootClassName,
  suffixIcon,
  generateConfig,
  allowClear = true,
  valueFormat,
  ...restProps
} = defineProps<RangePickerProps & { generateConfig: GenerateConfig }>();

const value = defineModel<DateType[]>('value', {
  get(e: any) {
    if (!e) return e;

    if (Array.isArray(e)) {
      return e.map((d) => {
        if (!d) return null;
        return generateConfig.isValidate(d) ? d : dayjs(d);
      });
    }

    return e; // 防止非数组意外情况
  },

  set(v: any[]) {
    if (!v || !Array.isArray(v)) return v;

    const formatValue = (d: any) => {
      if (!d) return null;
      const dayjsObj = generateConfig.isValidate(d) ? d : dayjs(d);
      return valueFormat ? dayjsObj.format(valueFormat) : dayjsObj;
    };

    return [formatValue(v[0]), formatValue(v[1])];
  },
});

const pickerValue = defineModel<DateType[]>('pickerValue');
const open = defineModel<boolean | undefined>('open', { default: undefined });

const pickerType = computed(() => (picker === TIME ? 'timePicker' : 'datePicker'));

const [mergedClassNames, mergedStyles] = useMergedPickerSemantic(
  pickerType,
  computed(() => classNames),
  computed(() => styles),
);

const innerRef = useTemplateRef('innerRef');
const { getPrefixCls, direction, getPopupContainer, rangePicker } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('picker', customizePrefixCls));
const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);
const rootPrefixCls = computed(() => getPrefixCls.value());

const [variant, enableVariantCls] = useVariant(
  'rangePicker',
  computed(() => customVariant),
);

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const mergedRootClassName = computed(() => clsx(hashId.value, cssVarCls.value, rootCls.value, rootClassName));

const vm = getCurrentInstance();

// ===================== Icon =====================
const [mergedAllowClear] = useIcons(
  computed(() => ({ ...vm.props, allowClear })),
  prefixCls,
);

// ================== components ==================
const mergedComponents = useComponents(computed(() => components)) as typeof components;

// ===================== Size =====================
const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize?.value ?? ctx));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

// ===================== FormItemInput =====================
const formItemContext = useFormItemInputContextInject();
const { hasFeedback, status: contextStatus, feedbackIcon } = toRefs(formItemContext);
const mergedSuffixIcon = () => (
  <SuffixIcon {...{ picker, hasFeedback: hasFeedback?.value, feedbackIcon: feedbackIcon?.value, suffixIcon }} />
);

defineExpose({
  get el() {
    return innerRef.value;
  },
});

const [contextLocale] = useLocale('Calendar', enUS);

const locale = computed(() => ({ ...contextLocale?.value, ...(restProps.locale as any) }));

// ============================ zIndex ============================
const [zIndex] = useZIndex(
  'DatePicker',
  computed(() => mergedStyles?.value?.popup?.root?.zIndex as number),
);
</script>
<template>
  <ContextIsolator space>
    <RCRangePicker
      ref="innerRef"
      v-bind="{ ...restProps as any }"
      v-model:value="value"
      v-model:picker-value="pickerValue"
      v-model:open="open"
      :separator="() => h('span', { 'aria-label': 'to', class: `${prefixCls}-separator` }, h(SwapRightOutlined))"
      :disabled="mergedDisabled"
      :placement="placement"
      :placeholder="getRangePlaceholder(locale, picker, placeholder)"
      :suffix-icon="mergedSuffixIcon"
      :prev-icon="() => h('span', { class: `${prefixCls}-prev-icon` })"
      :next-icon="() => h('span', { class: `${prefixCls}-next-icon` })"
      :super-prev-icon="() => h('span', { class: `${prefixCls}-super-prev-icon` })"
      :super-next-icon="() => h('span', { class: `${prefixCls}-super-next-icon` })"
      :transition-name="`${rootPrefixCls}-slide-up`"
      :picker="picker"
      :locale="locale!.lang"
      :get-popup-container="customGetPopupContainer || getPopupContainer"
      :generate-config="generateConfig"
      :components="mergedComponents"
      :direction="direction"
      :prefix-cls="prefixCls"
      :root-class-name="mergedRootClassName"
      :class="
        clsx(
          {
            [`${prefixCls}-${mergedSize}`]: mergedSize,
            [`${prefixCls}-${variant}`]: enableVariantCls,
          },
          getStatusClassNames(prefixCls, getMergedStatus(contextStatus, customStatus), hasFeedback),
          compactItemClassnames,
          className,
          rangePicker?.class,
        )
      "
      :style="{ ...rangePicker?.style, ...style }"
      :class-names="mergedClassNames"
      :styles="{
        ...mergedStyles,
        popup: {
          ...mergedStyles.popup,
          root: {
            ...mergedStyles.popup.root,
            zIndex,
          },
        },
      }"
      :allow-clear="mergedAllowClear"
    />
  </ContextIsolator>
</template>
