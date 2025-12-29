<script setup lang="tsx">
import { useComponentConfig } from '@/components/config-provider/context';
import useCSSVarCls from '@/components/config-provider/hooks/useCSSVarCls';
import { Field, useFieldContextInject, useListContextInject } from '@/vc-component/form';
import type { FieldProps } from '@/vc-component/form/Field.vue';
import type { Meta } from '@/vc-component/form/interface';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, getCurrentInstance, isVNode, ref, toRefs, useSlots } from 'vue';
import { useFormContextInject, useNoStyleItemContextInject } from '../context';
import type { FormItemLayout } from '../Form.vue';
import type { FormItemInputProps } from '../FormItemInput.vue';
import type { FormItemLabelProps, LabelTooltipType } from '../FormItemLabel.vue';
import useFrameState from '../hooks/useFrameState';
import type { InternalNamePath } from '../interface';
import useStyle from '../style';
import { getFieldId, toArray } from '../util';
import type { ItemHolderProps } from './ItemHolder.vue';
import ItemHolder from './ItemHolder.vue';
import StatusProvider from './StatusProvider.vue';
import useItemRef from '../hooks/useItemRef';
import isNonNullable from '../../_util/isNonNullable';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  name,
  noStyle,
  class: className,
  dependencies,
  prefixCls: customizePrefixCls,
  shouldUpdate = undefined,
  rules,
  required = undefined,
  label,
  messageVariables,
  trigger = 'onChange',
  validateTrigger = undefined,
  hidden,
  help,
  layout,
} = defineProps<FormItemProps>();

const NAME_SPLIT = '__SPLIT__';

interface FieldError {
  errors: string[];
  warnings: string[];
}

const _ValidateStatuses = ['success', 'warning', 'error', 'validating', ''] as const;
export type ValidateStatus = (typeof _ValidateStatuses)[number];

export type FeedbackIcons = (itemStatus: { status: ValidateStatus; errors?: VueNode[]; warnings?: VueNode[] }) => {
  // eslint-disable-next-line no-unused-vars
  [key in ValidateStatus]?: VueNode;
};

export interface FormItemProps<Values = any>
  extends Omit<FormItemLabelProps, 'requiredMark'>,
    FormItemInputProps,
    FieldProps<Values> {
  prefixCls?: string;
  noStyle?: boolean;
  style?: any;
  class?: string;
  rootClassName?: string;
  id?: string;
  hasFeedback?: boolean | { icons: FeedbackIcons };
  validateStatus?: ValidateStatus;
  required?: boolean;
  hidden?: boolean;
  initialValue?: any;
  messageVariables?: Record<string, string>;
  tooltip?: LabelTooltipType;
  layout?: FormItemLayout;
}

function genEmptyMeta(): Meta {
  return {
    errors: [],
    warnings: [],
    touched: false,
    validating: false,
    name: [],
    validated: false,
  };
}

const { getPrefixCls } = toRefs(useComponentConfig('form'));
const { name: formName } = toRefs(useFormContextInject());

// Don't call slots in setup, will cause warning
// mergedChildren will be computed inside render function to access context

const notifyParentMetaChange = useNoStyleItemContextInject();

const { validateTrigger: contextValidateTrigger } = toRefs(useFieldContextInject());
const mergedValidateTrigger = computed(() => (isNonNullable(validateTrigger) ? validateTrigger : contextValidateTrigger?.value));

const hasName = computed(() => isNonNullable(name));

const prefixCls = computed(() => getPrefixCls.value('form', customizePrefixCls));

// Style
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

// ========================= MISC =========================
// Get `noStyle` required info
const listContext = useListContextInject();
const fieldKeyPathRef = ref<InternalNamePath>(null);

// ======================== Errors ========================
// >>>>> Collect sub field errors
const [subFieldErrors, setSubFieldErrors] = useFrameState<Record<string, FieldError>>({});

const meta = ref(genEmptyMeta());

const onMetaChange = (nextMeta: Meta & { destroy?: boolean }) => {
  // This keyInfo is not correct when field is removed
  const keyInfo = listContext?.getKey(nextMeta.name);

  // Destroy will reset all the meta
  meta.value = nextMeta.destroy ? genEmptyMeta() : nextMeta;

  // Bump to parent since noStyle
  if (noStyle && (help as any) !== false && notifyParentMetaChange.value) {
    let namePath = nextMeta.name;

    if (!nextMeta.destroy) {
      if (keyInfo !== undefined) {
        const [fieldKey, restPath] = keyInfo;
        namePath = [fieldKey, ...restPath];
        fieldKeyPathRef.value = namePath;
      }
    } else {
      // Use origin cache data
      namePath = fieldKeyPathRef.value || namePath;
    }
    notifyParentMetaChange?.value?.(nextMeta, namePath);
  }
};

// >>>>> Collect noStyle Field error to the top FormItem
const onSubItemMetaChange: ItemHolderProps['onSubItemMetaChange'] = (subMeta, uniqueKeys) => {
  // Only `noStyle` sub item will trigger
  setSubFieldErrors((prevSubFieldErrors) => {
    const clone = {
      ...prevSubFieldErrors,
    };

    // name: ['user', 1] + key: [4] = ['user', 4]
    const mergedNamePath = [...subMeta.name.slice(0, -1), ...uniqueKeys];
    const mergedNameKey = mergedNamePath.join(NAME_SPLIT);

    if ((subMeta as any).destroy) {
      // Remove
      delete clone[mergedNameKey];
    } else {
      // Update
      clone[mergedNameKey] = subMeta;
    }

    return clone;
  });
};

// >>>>> Get merged errors
const mergedErrors = computed(() => {
  const errorList: string[] = [...meta.value.errors];
  Object.values(subFieldErrors.value).forEach((subFieldError) => {
    errorList.push(...(subFieldError.errors || []));
  });
  return errorList;
});
const mergedWarnings = computed(() => {
  const warningList: string[] = [...meta.value.warnings];
  Object.values(subFieldErrors.value).forEach((subFieldError) => {
    warningList.push(...(subFieldError.warnings || []));
  });
  return warningList;
});

const getItemRef = useItemRef();

const variables = computed(() => {
  let result: Record<string, string> = {};
  if (typeof label === 'string') {
    result.label = label;
  } else if (name) {
    result.label = String(name);
  }
  if (messageVariables) {
    result = { ...result, ...messageVariables };
  }
  return result;
});

const vm = getCurrentInstance() as any;

const slots = useSlots();
const RenderContent = (props) => {
  const { control, meta: renderMeta, form: context } = props;
  const mergedName = toArray(name).length && renderMeta ? renderMeta.name : [];
  const fieldId = getFieldId(mergedName, formName?.value);

  const isRequired =
    required !== undefined
      ? required
      : !!rules?.some((rule: any) => {
          if (rule && typeof rule === 'object' && rule.required && !rule.warningOnly) {
            return true;
          }
          if (typeof rule === 'function') {
            const ruleEntity = rule(context);
            return ruleEntity?.required && !ruleEntity?.warningOnly;
          }
          return false;
        });

  function renderLayout() {
    // Get slots.default result - for shouldUpdate scenario, pass context directly
    const defaultSlotResult = slots.default?.(context);
    const mergedChildren = flattenChildren(defaultSlotResult)[0];
    let childNode: VueNode = null;

    if (isVNode(mergedChildren)) {
      mergedChildren.props = {
        ...mergedChildren.props,
        ...control,
        ref: getItemRef(mergedName, mergedChildren),
      };
      childNode = mergedChildren;
    } else {
      childNode = mergedChildren as VueNode;
    }
    return childNode;
  }
  return (
    <>
      {noStyle && !hidden ? (
        <StatusProvider
          prefixCls={prefixCls.value}
          hasFeedback={vm.props.hasFeedback}
          validateStatus={vm.props.validateStatus}
          meta={meta.value}
          errors={mergedErrors.value}
          warnings={mergedWarnings.value}
          noStyle
          name={name}
        >
          {renderLayout}
        </StatusProvider>
      ) : (
        <ItemHolder
          key="row"
          {...vm.props}
          class={clsx(className, cssVarCls.value, rootCls.value, hashId.value)}
          prefixCls={prefixCls.value}
          fieldId={fieldId}
          isRequired={isRequired}
          errors={mergedErrors.value}
          warnings={mergedWarnings.value}
          meta={meta.value}
          onSubItemMetaChange={onSubItemMetaChange}
          layout={layout}
          name={name}
        >
          {renderLayout}
        </ItemHolder>
      )}
    </>
  );
};
</script>

<template>
  <template v-if="!hasName && !dependencies && !shouldUpdate">
    <StatusProvider
      v-if="noStyle && !hidden"
      :prefix-cls="prefixCls"
      :has-feedback="hasFeedback"
      :validate-status="validateStatus"
      :meta="meta"
      :errors="mergedErrors"
      :warnings="mergedWarnings"
      no-style
      :name="name"
    >
      <slot></slot>
    </StatusProvider>
    <ItemHolder
      v-else
      key="row"
      v-bind="$props"
      :class="clsx(className, cssVarCls, rootCls, hashId)"
      :prefix-cls="prefixCls"
      :field-id="null"
      :is-required="false"
      :errors="mergedErrors"
      :warnings="mergedWarnings"
      :meta="meta"
      :on-sub-item-meta-change="onSubItemMetaChange"
      :layout="layout"
      :name="name"
    >
      <slot></slot>
    </ItemHolder>
  </template>
  <Field
    v-else
    :name="name"
    :dependencies="dependencies"
    :rules="rules"
    :validate-trigger="mergedValidateTrigger"
    :preserve="preserve"
    :should-update="shouldUpdate"
    :message-variables="variables"
    :trigger="trigger"
    :value-prop-name="valuePropName"
    :get-value-from-event="getValueFromEvent"
    :get-value-props="getValueProps"
    :normalize="normalize"
    @meta-change="onMetaChange"
  >
    <template #default="props">
      <RenderContent v-bind="props" />
    </template>
  </Field>
</template>
