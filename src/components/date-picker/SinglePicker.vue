<script lang="tsx" setup>
import { computed, getCurrentInstance, h, toRefs, useTemplateRef } from 'vue';
import type { PickerProps } from './generatePicker';
import useMergedPickerSemantic from './hooks/useMergedPickerSemantic';
import { useConfigContextInject } from '../config-provider';
import { useCompactItemContext } from '../space/CompactContext';
import useVariant from '../form/hooks/useVariants';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
import clsx from 'clsx';
import { reactiveComputed } from '@vueuse/core';
import type { TimePickerProps } from '../time-picker';
import { getPlaceholder, useIcons } from './util';
import useComponents from './generatePicker/useComponents';
import useSize from '../config-provider/hooks/useSize';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { useFormItemInputContextInject } from '../form/context';
import { useLocale } from '../locale';
import enUS from './locale/en_US';
import { useZIndex } from '../_util/hooks/useZIndex';
import ContextIsolator from '../_util/ContextIsolator';
import RCPicker from '@/vc-component/picker';
import type { GenerateConfig } from '@/vc-component/picker/generate';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import SuffixIcon from './generatePicker/SuffixIcon.vue';
import dayjs from 'dayjs';
import type { DateType } from '@/vc-util/type';

const {
  prefixCls: customizePrefixCls,
  getPopupContainer: customizeGetPopupContainer,
  components,
  style,
  class: className,
  size: customizeSize,
  placement,
  placeholder,
  disabled: customDisabled,
  status: customStatus,
  variant: customVariant,
  onCalendarChange,
  classNames,
  styles,
  rootClassName,
  suffixIcon,
  pickerType,
  generateConfig,
  picker,
  showNow = true,
  allowClear = true,
  valueFormat,
  ...restProps
} = defineProps<PickerProps & { pickerType?: 'timePicker' | 'datePicker'; generateConfig: GenerateConfig }>();

const value = defineModel<DateType | DateType[] | null>('value', {
  get(e: any) {
    if (!e) return e;

    // 转成 dayjs 实例
    const toDayjs = (v: any) => {
      if (generateConfig.isValidate(v)) return v; // 已经是有效 dayjs
      return dayjs(v); // 转成 dayjs
    };

    if (Array.isArray(e)) {
      return e.map(toDayjs);
    }
    return toDayjs(e);
  },

  set(v: any) {
    if (!v) return v;

    const formatValue = (d: any) => {
      const instance = generateConfig.isValidate(d) ? d : dayjs(d);
      return valueFormat ? instance.format(valueFormat) : instance;
    };

    if (Array.isArray(v)) {
      return v.map(formatValue);
    }
    return formatValue(v);
  },
});
const pickerValue = defineModel<DateType | DateType[]>('pickerValue');
const open = defineModel<boolean>('open', { default: undefined });

const [mergedClassNames, mergedStyles] = useMergedPickerSemantic(
  computed(() => pickerType),
  computed(() => classNames),
  computed(() => styles),
);

const {
  getPrefixCls,
  direction,
  getPopupContainer,
  // Consume different styles according to different names
  [pickerType]: contextPickerConfig,
} = toRefs(useConfigContextInject());

const prefixCls = computed(() => getPrefixCls.value('picker', customizePrefixCls));
const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);
const innerRef = useTemplateRef('innerRef');

const [variant, enableVariantCls] = useVariant(
  'datePicker',
  computed(() => customVariant),
);

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const mergedRootClassName = computed(() => clsx(hashId.value, cssVarCls.value, rootCls.value, rootClassName));

defineExpose({
  get el() {
    return innerRef.value;
  },
});

const additionalProps = {
  showToday: true,
};

const rootPrefixCls = computed(() => getPrefixCls.value());

// ==================== Legacy =====================
const { onSelect, multiple } = toRefs(reactiveComputed(() => restProps) as TimePickerProps);
const hasLegacyOnSelect = computed(() => onSelect.value && picker === 'time' && !multiple.value);

const onInternalCalendarChange: typeof onCalendarChange = (date, dateStr, info) => {
  onCalendarChange?.(date, dateStr, info);
  if (hasLegacyOnSelect.value) {
    onSelect?.value?.(date as any);
  }
};

const vm = getCurrentInstance();

// ===================== Icon =====================
const [mergedAllowClear, removeIcon] = useIcons(
  computed(() => ({ ...vm.props, allowClear })),
  prefixCls,
);

// ================== components ==================
const mergedComponents = useComponents(computed(() => components)) as typeof components;

// ===================== Size =====================
const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize ?? ctx));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

// ===================== FormItemInput =====================
const formItemContext = useFormItemInputContextInject();
const { hasFeedback, status: contextStatus, feedbackIcon } = toRefs(formItemContext);

const mergedSuffixIcon = () => (
  <SuffixIcon {...{ picker, hasFeedback: hasFeedback?.value, feedbackIcon: feedbackIcon?.value, suffixIcon }} />
);

const [contextLocale] = useLocale('DatePicker', enUS);

const locale = computed(() => ({ ...contextLocale?.value, ...(restProps.locale as any) }));

// ============================ zIndex ============================
const [zIndex] = useZIndex(
  'DatePicker',
  computed(() => mergedStyles?.value?.popup?.root?.zIndex as number),
);
</script>
<template>
  <ContextIsolator space>
    <RCPicker
      ref="innerRef"
      v-bind="{ ...additionalProps, ...restProps }"
      v-model:value="value"
      v-model:picker-value="pickerValue"
      v-model:open="open"
      :show-now="showNow"
      :placeholder="getPlaceholder(locale, picker, placeholder)"
      :suffix-icon="mergedSuffixIcon"
      :placement="placement"
      :prev-icon="() => h('span', { class: `${prefixCls}-prev-icon` })"
      :next-icon="() => h('span', { class: `${prefixCls}-next-icon` })"
      :super-prev-icon="() => h('span', { class: `${prefixCls}-super-prev-icon` })"
      :super-next-icon="() => h('span', { class: `${prefixCls}-super-next-icon` })"
      :transition-name="`${rootPrefixCls}-slide-up`"
      :picker="picker"
      @calendar-change="onInternalCalendarChange"
      :locale="locale!.lang"
      :get-popup-container="customizeGetPopupContainer || getPopupContainer"
      :generate-config="generateConfig"
      :components="mergedComponents"
      :direction="direction"
      :disabled="mergedDisabled"
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
          contextPickerConfig?.class,
          className,
        )
      "
      :style="{ ...contextPickerConfig?.style, ...style }"
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
      :remove-icon="removeIcon"
    />
  </ContextIsolator>
</template>
