<script lang="tsx" setup>
import FieldForm from '@/vc-component/form/Form.vue';
import type { InternalNamePath, ValidateErrorEntity } from '@/vc-component/form/interface';
import clsx from 'clsx';
import { computed, toRefs, useTemplateRef } from 'vue';

import type { FormProps as RcFormProps } from '@/vc-component/form/Form.vue';
import type { VueNode } from '@/vc-util/type';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import type { Variant } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { DisabledContextProvider, useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import { SizeContextProvider } from '../config-provider/SizeContext';
import type { ColProps } from '../grid/col.vue';
import type { FormContextProps } from './context';
import { FormContextProvider, FormProvider, NoStyleItemContextProvider, VariantContextProvider } from './context';
import type { FeedbackIcons } from './FormItem';
import type { FormInstance } from './hooks/useForm';
import useForm from './hooks/useForm';
import type { FormLabelAlign, ScrollFocusOptions } from './interface';
import useStyle from './style';
import { useValidateMessagesContextInject } from './validateMessagesContext';

export type RequiredMark = boolean | 'optional' | ((labelNode: VueNode, info: { required: boolean }) => VueNode);
export type FormLayout = 'horizontal' | 'inline' | 'vertical';
export type FormItemLayout = 'horizontal' | 'vertical';

export type { ScrollFocusOptions };

export type SemanticName = 'root' | 'label' | 'content';

export interface FormProps<Values = any> extends Omit<RcFormProps<Values>, 'form'> {
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, any>>;
  prefixCls?: string;
  colon?: boolean;
  name?: string;
  layout?: FormLayout;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  form?: FormInstance<Values>;
  feedbackIcons?: FeedbackIcons;
  size?: SizeType;
  disabled?: boolean;
  scrollToFirstError?: ScrollFocusOptions | boolean;
  requiredMark?: RequiredMark;
  rootClassName?: string;
  variant?: Variant;
  initialValues?: any;
  fields?: any[];
  validateMessages?: any;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  onFieldsChange?: (changedFields: any[], allFields: any[]) => void;
  onFinish?: (values: any) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity) => void;
  validateTrigger?: string | string[];
  preserve?: boolean;
  clearOnDestroy?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  size,
  disabled: customDisabled,
  form,
  colon,
  labelAlign,
  labelWrap,
  labelCol,
  wrapperCol,
  layout = 'horizontal',
  scrollToFirstError,
  requiredMark = undefined,
  onFinishFailed,
  name,
  style,
  feedbackIcons,
  variant,
  classNames: formClassNames,
  styles,
  ...restFormProps
} = defineProps<FormProps>();

const contextDisabled = useDisabledContextInject();

const disabled = computed(() => contextDisabled.value || customDisabled);

const {
  getPrefixCls,
  direction,
  requiredMark: contextRequiredMark,
  colon: contextColon,
  scrollToFirstError: contextScrollToFirstError,
  class: contextClassName,
  style: contextStyle,
  styles: contextStyles,
  classNames: contextClassNames,
} = toRefs(useComponentConfig('form'));

// These might not be in componentConfig, provide defaults

const mergedSize = useSize(computed(() => size));

const contextValidateMessages = useValidateMessagesContextInject();

const mergedRequiredMark = computed(() => {
  if (requiredMark !== undefined) {
    return requiredMark;
  }

  if (contextRequiredMark?.value !== undefined) {
    return contextRequiredMark.value;
  }

  return true;
});

const mergedColon = computed(() => colon ?? contextColon.value);

const prefixCls = computed(() => getPrefixCls.value('form', customizePrefixCls));

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, formClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const formClassName = computed(() =>
  clsx(
    prefixCls.value,
    `${prefixCls.value}-${layout}`,
    {
      [`${prefixCls.value}-hide-required-mark`]: mergedRequiredMark.value === false,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-${mergedSize.value}`]: mergedSize.value,
    },
    cssVarCls.value,
    rootCls.value,
    hashId.value,
    contextClassName?.value,
    className,
    rootClassName,
    mergedClassNames.value,
  ),
);

const [wrapForm] = useForm(form);
const { __INTERNAL__ } = wrapForm;
__INTERNAL__.name = name;

const formContextValue = computed<FormContextProps>(() => ({
  name,
  labelAlign,
  labelCol,
  labelWrap,
  wrapperCol,
  layout,
  colon: mergedColon.value,
  requiredMark: mergedRequiredMark.value,
  itemRef: __INTERNAL__.itemRef,
  form: wrapForm,
  feedbackIcons,
  classNames: mergedClassNames.value,
  styles: mergedStyles.value,
}));

const nativeElementRef = useTemplateRef('nativeElementRef');

const scrollToField = (options: ScrollFocusOptions | boolean, fieldName: InternalNamePath) => {
  if (options) {
    let defaultScrollToFirstError: ScrollFocusOptions = { block: 'nearest' };
    if (typeof options === 'object') {
      defaultScrollToFirstError = { ...defaultScrollToFirstError, ...options };
    }
    wrapForm.scrollToField(fieldName, defaultScrollToFirstError);
  }
};

const onInternalFinishFailed = (errorInfo: ValidateErrorEntity) => {
  onFinishFailed?.(errorInfo);
  if (errorInfo.errorFields.length) {
    const fieldName = errorInfo.errorFields[0].name;
    if (scrollToFirstError !== undefined) {
      scrollToField(scrollToFirstError, fieldName);
      return;
    }

    if (contextScrollToFirstError.value !== undefined) {
      scrollToField(contextScrollToFirstError.value, fieldName);
    }
  }
};

defineExpose({
  ...wrapForm,
  get nativeElement() {
    return nativeElementRef.value.nativeElement;
  },
});
</script>

<template>
  <VariantContextProvider :value="variant">
    <DisabledContextProvider :disabled="disabled">
      <SizeContextProvider :size="mergedSize">
        <FormProvider
          :value="{
            validateMessagesValue: contextValidateMessages,
          }"
        >
          <FormContextProvider :value="formContextValue">
            <NoStyleItemContextProvider :value="null">
              <FieldForm
                :id="name"
                v-bind="{ ...restFormProps, ...$attrs }"
                :name="name"
                @finish-failed="onInternalFinishFailed"
                :form="wrapForm"
                ref="nativeElementRef"
                :style="{ ...mergedStyles, ...contextStyle, ...style }"
                :class="formClassName"
              >
                <slot></slot>
              </FieldForm>
            </NoStyleItemContextProvider>
          </FormContextProvider>
        </FormProvider>
      </SizeContextProvider>
    </DisabledContextProvider>
  </VariantContextProvider>
</template>
