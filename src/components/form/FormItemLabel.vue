<script lang="tsx" setup>
import { computed, toRefs } from 'vue';
import QuestionCircleOutlined from '@ant-design/icons-vue/QuestionCircleOutlined';
import clsx from 'clsx';

import convertToTooltipProps from '../_util/convertToTooltipProps';
import type { ColProps } from '../grid/col.vue';
import Col from '../grid/col.vue';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import type { TooltipProps } from '../tooltip';
import Tooltip from '../tooltip';
import { useFormContextInject } from './context';
import type { RequiredMark } from './Form.vue';
import type { FormLabelAlign } from './interface';
import type { VueNode } from '@/vc-util/type';
import { cloneElement } from '@/vc-util/Children/util';
import Render from '@/vc-component/render';

export type WrapperTooltipProps = TooltipProps & {
  icon?: VueNode;
};

export type LabelTooltipType = WrapperTooltipProps | VueNode;

export interface FormItemLabelProps {
  colon?: boolean;
  htmlFor?: string;
  label?: VueNode;
  labelAlign?: FormLabelAlign;
  labelCol?: ColProps;
  requiredMark?: RequiredMark;
  tooltip?: LabelTooltipType;
  vertical?: boolean;
  required?: boolean;
  prefixCls?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  label,
  htmlFor,
  labelCol,
  labelAlign,
  colon,
  required = undefined,
  requiredMark,
  tooltip,
  vertical,
} = defineProps<FormItemLabelProps & { required?: boolean; prefixCls: string }>();

const [formLocale] = useLocale('Form');

const {
  labelAlign: contextLabelAlign,
  labelCol: contextLabelCol,
  labelWrap,
  colon: contextColon,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useFormContextInject());

const mergedLabelCol = computed<ColProps>(() => labelCol || contextLabelCol?.value || {});

const mergedLabelAlign = computed<FormLabelAlign | undefined>(() => labelAlign || contextLabelAlign?.value);

const labelClsBasic = computed(() => `${prefixCls}-item-label`);
const labelColClassName = computed(() =>
  clsx(`${labelClsBasic.value}`, mergedLabelAlign.value === 'left' && `${labelClsBasic.value}-left`, mergedLabelCol.value.class, {
    [`${labelClsBasic.value}-wrap`]: !!labelWrap?.value,
  }),
);

const computedColon = computed(() => colon === true || (contextColon?.value !== false && colon !== false));

const haveColon = computed(() => computedColon.value && !vertical);

const LabelChildren = () => {
  if (!label) return null;

  let labelChildren: VueNode = label;

  // Remove duplicated user input colon
  if (haveColon.value && typeof label === 'string' && label.trim()) {
    labelChildren = label.replace(/[:|：]\s*$/, '');
  }

  // Tooltip
  const tooltipProps = convertToTooltipProps(tooltip);
  if (tooltipProps) {
    const { icon = <QuestionCircleOutlined />, ...restTooltipProps } = tooltipProps;
    const tooltipNode = (
      <Tooltip {...restTooltipProps}>
        {cloneElement(icon as any, {
          class: `${prefixCls}-item-tooltip`,
          title: '',
          onClick: (e: MouseEvent) => {
            e.preventDefault();
          },
          tabindex: null,
        })}
      </Tooltip>
    );

    labelChildren = (
      <>
        <Render content={labelChildren}></Render>
        {tooltipNode}
      </>
    );
  }

  // Required Mark
  const isOptionalMark = requiredMark === 'optional';
  const isRenderMark = typeof requiredMark === 'function';

  if (isRenderMark) {
    labelChildren = (requiredMark as Function)(labelChildren, { required: !!required });
  } else if (isOptionalMark && !required) {
    labelChildren = (
      <>
        {labelChildren}
        <span class={`${prefixCls}-item-optional`} title="">
          {formLocale.value?.optional || defaultLocale.Form?.optional}
        </span>
      </>
    );
  }

  return labelChildren;
};

const markType = computed(() => {
  const hideRequiredMark = requiredMark === false;
  const isOptionalMark = requiredMark === 'optional';
  const isRenderMark = typeof requiredMark === 'function';

  if (hideRequiredMark) {
    return 'hidden';
  } else if (isOptionalMark || isRenderMark) {
    return 'optional';
  }
  return undefined;
});

const labelClassName = computed(() =>
  clsx(contextClassNames?.value?.label, {
    [`${prefixCls}-item-required`]: required,
    [`${prefixCls}-item-required-mark-${markType.value}`]: markType.value,
    [`${prefixCls}-item-no-colon`]: !computedColon.value,
  }),
);
</script>

<template>
  <Col v-if="label" v-bind="mergedLabelCol" :class="labelColClassName">
    <label :for="htmlFor" :class="labelClassName" :style="contextStyles?.label" :title="typeof label === 'string' ? label : ''">
      <LabelChildren />
    </label>
  </Col>
</template>
