<script lang="tsx" setup>
import type { Meta } from '@/vc-component/form/interface';
import type { VueNode } from '@/vc-util/type';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons-vue';
import { computed, toRefs } from 'vue';
import clsx from 'clsx';

import type { NamePath } from '../interface';
import { useFormContextInject } from '../context';
import { useFormItemInputContextInject, FormItemInputContextProvider } from '../context';
import { getStatus } from '../util';
import type { FeedbackIcons, ValidateStatus } from './index';

export interface StatusProviderProps {
  validateStatus?: ValidateStatus;
  prefixCls: string;
  meta: Meta;
  errors: VueNode[];
  warnings: VueNode[];
  hasFeedback?: boolean | { icons?: FeedbackIcons };
  noStyle?: boolean;
  name?: NamePath;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { errors, warnings, hasFeedback, validateStatus, prefixCls, meta, noStyle, name } = defineProps<StatusProviderProps>();

const iconMap = {
  success: CheckCircleFilled,
  warning: ExclamationCircleFilled,
  error: CloseCircleFilled,
  validating: LoadingOutlined,
};

const itemPrefixCls = computed(() => `${prefixCls}-item`);
const { feedbackIcons } = toRefs(useFormContextInject());

const mergedValidateStatus = computed(() => getStatus(errors, warnings, meta, null, !!hasFeedback, validateStatus));

const {
  isFormItemInput: parentIsFormItemInput,
  status: parentStatus,
  hasFeedback: parentHasFeedback,
  feedbackIcon: parentFeedbackIcon,
  name: parentName,
} = toRefs(useFormItemInputContextInject());

// ====================== Context =======================
const formItemStatusContext = computed(() => {
  let feedbackIcon: VueNode;
  if (hasFeedback) {
    const customIcons = (hasFeedback !== true && hasFeedback.icons) || feedbackIcons?.value;
    const customIconNode =
      mergedValidateStatus.value &&
      customIcons?.({ status: mergedValidateStatus.value, errors, warnings })?.[mergedValidateStatus.value];
    const IconNode = mergedValidateStatus.value && iconMap[mergedValidateStatus.value];
    feedbackIcon =
      customIconNode !== false && IconNode ? (
        <span
          class={clsx(
            `${itemPrefixCls.value}-feedback-icon`,
            `${itemPrefixCls.value}-feedback-icon-${mergedValidateStatus.value}`,
          )}
        >
          {customIconNode || <IconNode />}
        </span>
      ) : null;
  }

  const context = {
    status: mergedValidateStatus.value || '',
    errors,
    warnings,
    hasFeedback: !!hasFeedback,
    feedbackIcon,
    isFormItemInput: true,
    name,
  };

  // No style will follow parent context
  if (noStyle) {
    context.status = (mergedValidateStatus.value ?? parentStatus?.value) || '';
    context.isFormItemInput = parentIsFormItemInput?.value;
    context.hasFeedback = !!(hasFeedback ?? parentHasFeedback?.value);
    context.feedbackIcon = hasFeedback !== undefined ? context.feedbackIcon : parentFeedbackIcon?.value;
    context.name = name ?? parentName?.value;
  }

  return context;
});
</script>

<template>
  <FormItemInputContextProvider :value="formItemStatusContext">
    <slot></slot>
  </FormItemInputContextProvider>
</template>
