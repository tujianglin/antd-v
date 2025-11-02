<script lang="tsx" setup>
import type { Meta } from '@/vc-component/form/interface';
import isVisible from '@/vc-util/Dom/isVisible';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { computed, ref, toRefs, watch, type CSSProperties } from 'vue';
import type { FormItemProps } from '.';
import { Row } from '../../grid';
import { NoStyleItemContextProvider, useFormContextInject, type ReportMetaChange } from '../context';
import FormItemInput from '../FormItemInput.vue';
import FormItemLabel from '../FormItemLabel.vue';
import useDebounce from '../hooks/useDebounce';
import { getStatus } from '../util';
import StatusProvider from './StatusProvider.vue';

export interface ItemHolderProps extends FormItemProps {
  prefixCls: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  errors: VueNode[];
  warnings: VueNode[];
  meta: Meta;
  fieldId?: string;
  isRequired?: boolean;
  onSubItemMetaChange: ReportMetaChange;
}

const {
  prefixCls,
  class: className,
  rootClassName,
  style,
  help,
  errors,
  warnings,
  validateStatus,
  meta,
  hasFeedback = undefined,
  hidden = undefined,
  fieldId,
  required = undefined,
  isRequired = undefined,
  onSubItemMetaChange,
  layout: propsLayout,
  name,
  ...restProps
} = defineProps<ItemHolderProps>();

const itemPrefixCls = computed(() => `${prefixCls}-item`);
const { requiredMark, layout: formLayout } = toRefs(useFormContextInject());
const layout = computed(() => propsLayout || formLayout?.value);

const vertical = computed(() => layout.value === 'vertical');

// ======================== Margin ========================
const itemRef = ref<HTMLDivElement>(null);
const debounceErrors = useDebounce(computed(() => errors));
const debounceWarnings = useDebounce(computed(() => warnings));
const hasHelp = computed(() => help !== undefined && help !== null);
const hasError = computed(() => !!(hasHelp.value || errors.length || warnings.length));
const isOnScreen = computed(() => !!itemRef.value && isVisible(itemRef.value));
const marginBottom = ref<number | null>(null);

watch(
  [hasError, isOnScreen],
  () => {
    if (hasError.value && itemRef.value) {
      // The element must be part of the DOMTree to use getComputedStyle
      // https://stackoverflow.com/questions/35360711/getcomputedstyle-returns-a-cssstyledeclaration-but-all-properties-are-empty-on-a
      const itemStyle = getComputedStyle(itemRef.value);
      marginBottom.value = parseInt(itemStyle.marginBottom, 10);
    }
  },
  { immediate: true },
);

const onErrorVisibleChanged = (nextVisible: boolean) => {
  if (!nextVisible) {
    marginBottom.value = null;
  }
};

// ======================== Status ========================

const getValidateState = (isDebounce = false) => {
  const _errors = isDebounce ? debounceErrors.value : meta.errors;
  const _warnings = isDebounce ? debounceWarnings.value : meta.warnings;

  return getStatus(_errors, _warnings, meta, '', !!hasFeedback, validateStatus);
};

const mergedValidateStatus = computed(() => getValidateState());

// ======================== Render ========================
const itemClassName = computed(() =>
  clsx(itemPrefixCls.value, className, rootClassName, {
    [`${itemPrefixCls.value}-with-help`]: hasHelp.value || debounceErrors.value?.length || debounceWarnings.value?.length,

    // Status
    [`${itemPrefixCls.value}-has-feedback`]: mergedValidateStatus.value && hasFeedback,
    [`${itemPrefixCls.value}-has-success`]: mergedValidateStatus.value === 'success',
    [`${itemPrefixCls.value}-has-warning`]: mergedValidateStatus.value === 'warning',
    [`${itemPrefixCls.value}-has-error`]: mergedValidateStatus.value === 'error',
    [`${itemPrefixCls.value}-is-validating`]: mergedValidateStatus.value === 'validating',
    [`${itemPrefixCls.value}-hidden`]: hidden,

    // Layout
    [`${itemPrefixCls.value}-${layout.value}`]: layout.value,
  }),
);
</script>
<template>
  <div :class="itemClassName" :style="style" ref="itemRef">
    <Row
      :class="`${itemPrefixCls}-row`"
      v-bind="omit(restProps, [
          '_internalItemRender' as any,
          'colon',
          'dependencies',
          'extra',
          'fieldKey',
          'getValueFromEvent',
          'getValueProps',
          'htmlFor',
          'id', 
          'initialValue',
          'isListField',
          'label',
          'labelAlign',
          'labelCol',
          'labelWrap',
          'messageVariables',
          'name',
          'normalize',
          'noStyle',
          'preserve',
          'requiredMark',
          'rules',
          'shouldUpdate',
          'trigger',
          'tooltip',
          'validateFirst',
          'validateTrigger',
          'valuePropName',
          'wrapperCol',
          'validateDebounce',
        ])"
    >
      <FormItemLabel
        :html-for="fieldId"
        v-bind="$props"
        :required-mark="requiredMark"
        :required="required ?? isRequired"
        :prefix-cls="prefixCls"
        :vertical="vertical"
      />
      <FormItemInput
        v-bind="{ ...$props, ...meta }"
        :errors="debounceErrors"
        :warnings="debounceWarnings"
        :prefix-cls="prefixCls"
        :status="mergedValidateStatus"
        :help="help"
        :margin-bottom="marginBottom"
        @error-visible-changed="onErrorVisibleChanged"
      >
        <NoStyleItemContextProvider :value="onSubItemMetaChange">
          <StatusProvider
            :prefix-cls="prefixCls"
            :meta="meta"
            :errors="meta.errors"
            :warnings="meta.warnings"
            :has-feedback="hasFeedback"
            :validate-status="mergedValidateStatus"
            :name="name"
          >
            <slot></slot>
          </StatusProvider>
        </NoStyleItemContextProvider>
      </FormItemInput>
    </Row>
    <div
      v-if="!!marginBottom"
      :class="`${itemPrefixCls}-margin-offset`"
      :style="{
        marginBottom: `${-marginBottom}px`,
      }"
    ></div>
  </div>
</template>
