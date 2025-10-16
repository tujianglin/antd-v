<script lang="tsx" setup>
import RcMentions from '@/vc-component/mentions';
import type {
  DataDrivenOptionProps as MentionsOptionProps,
  MentionsProps as RcMentionsProps,
  MentionsRef as RcMentionsRef,
} from '@/vc-component/mentions/Mentions.vue';
import getAllowClear from '../_util/getAllowClear';
import type { InputStatus } from '../_util/statusUtils';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useVariant from '../form/hooks/useVariants';
import Spin from '../spin';
import useStyle from './style';
import { computed, ref, toRefs, useTemplateRef, type CSSProperties } from 'vue';
import { useFormItemInputContextInject } from '../form/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty.vue';
import clsx from 'clsx';
import Render from '@/vc-component/render';

export type { DataDrivenOptionProps as MentionsOptionProps } from '@/vc-component/mentions/Mentions.vue';

export type MentionPlacement = 'top' | 'bottom';

export interface OptionProps {
  value: string;
  [key: string]: any;
}

type SemanticName = 'root' | 'textarea' | 'popup';

export interface MentionProps extends Omit<RcMentionsProps, 'suffix' | 'classNames' | 'styles'> {
  rootClassName?: string;
  loading?: boolean;
  status?: InputStatus;
  options?: MentionsOptionProps[];
  popupClassName?: string;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
  classNames?: RcMentionsProps['classNames'] & Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export interface MentionsProps extends MentionProps {}

export interface MentionsRef extends RcMentionsRef {}

defineOptions({ name: 'Mentions', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  disabled: customDisabled,
  loading,
  filterOption,
  notFoundContent,
  options,
  status: customStatus,
  allowClear = false,
  popupClassName,
  style,
  variant: customVariant,
  classNames: mentionsClassNames,
  styles,
  ...restProps
} = defineProps<MentionsProps>();

// ============================== Value ===============================
const mergedValue = defineModel('value', { default: '' });
function loadingFilterOption() {
  return true;
}
const focused = ref(false);
const innerRef = useTemplateRef('innerRef');

defineExpose({
  get el() {
    return innerRef.value;
  },
});

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('mentions'));
const { renderEmpty } = toRefs(useConfigContextInject());
const { status: contextStatus, hasFeedback, feedbackIcon } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));
// ===================== Disabled =====================
const contextDisabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? contextDisabled?.value);

const onFocus = (e) => {
  if (restProps.onFocus) {
    restProps.onFocus(e);
  }
  focused.value = true;
};

const onBlur = (e) => {
  if (restProps.onBlur) {
    restProps.onBlur(e);
  }

  focused.value = false;
};

const notFoundContentEle = computed(() => {
  if (notFoundContent !== undefined) {
    return notFoundContent;
  }
  return renderEmpty?.value?.('Select') || <DefaultRenderEmpty componentName="Select" />;
});

const mergedOptions = computed(() => {
  return loading
    ? [
        {
          value: 'ANTD_SEARCHING',
          disabled: true,
          label: <Spin size="small" />,
        },
      ]
    : options;
});

const mentionsfilterOption = computed(() => (loading ? loadingFilterOption : filterOption));

const prefixCls = computed(() => getPrefixCls.value('mentions', customizePrefixCls));

const mergedAllowClear = computed(() => getAllowClear(allowClear));

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const [variant, enableVariantCls] = useVariant(
  'mentions',
  computed(() => customVariant),
);

const suffixNode = () => hasFeedback?.value && <Render content={feedbackIcon?.value}></Render>;

const mergedClassName = computed(() =>
  clsx(
    contextClassName?.value,
    className,
    rootClassName,
    cssVarCls.value,
    rootCls.value,
    contextClassNames?.value?.root,
    mentionsClassNames?.root,
  ),
);
</script>
<template>
  <RcMentions
    ref="innerRef"
    v-bind="restProps"
    v-model:value="mergedValue"
    :silent="loading"
    :prefix-cls="prefixCls"
    :not-found-content="notFoundContentEle"
    :class="mergedClassName"
    :allow-clear="mergedAllowClear"
    :direction="direction"
    :style="{ ...contextStyles.root, ...styles?.root, ...contextStyle, ...style }"
    :filter-option="mentionsfilterOption"
    @focus="onFocus"
    @blur="onBlur"
    :options="mergedOptions"
    :suffix="suffixNode"
    :styles="{
      textarea: { ...contextStyles.textarea, ...styles?.textarea },
      popup: { ...contextStyles.popup, ...styles?.popup },
    }"
    :class-names="{
      textarea: clsx(mentionsClassNames?.textarea, contextClassNames.textarea),
      popup: clsx(mentionsClassNames?.popup, contextClassNames.popup, popupClassName, rootClassName, hashId, cssVarCls, rootCls),
      mentions: clsx(
        {
          [`${prefixCls}-disabled`]: mergedDisabled,
          [`${prefixCls}-focused`]: focused,
          [`${prefixCls}-rtl`]: direction === 'rtl',
        },
        hashId,
      ),
      variant: clsx(
        {
          [`${prefixCls}-${variant}`]: enableVariantCls,
        },
        getStatusClassNames(prefixCls, mergedStatus),
      ),
      affixWrapper: hashId,
    }"
  />
</template>
