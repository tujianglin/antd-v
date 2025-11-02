<script lang="tsx" setup>
import { computed, getCurrentInstance, ref, toRefs, watch, type VNode } from 'vue';
import clsx from 'clsx';

import type { ColProps } from '../grid/col.vue';
import Col from '../grid/col.vue';
import { useFormContextInject, FormItemPrefixContextProvider, FormContextProvider } from './context';
import ErrorList from './ErrorList.vue';
import type { ValidateStatus } from './FormItem';
import FallbackCmp from './style/fallbackCmp';
import type { VueNode } from '@/vc-util/type';
import get from '@/vc-util/utils/get';
import set from '@/vc-util/utils/set';
import Render from '@/vc-component/render';

interface FormItemInputMiscProps {
  prefixCls: string;
  errors: VueNode[];
  warnings: VueNode[];
  marginBottom?: number | null;
  onErrorVisibleChanged?: (visible: boolean) => void;
  // eslint-disable-next-line vue/prop-name-casing
  _internalItemRender?: {
    mark: string;
    render: (
      props: FormItemInputProps & FormItemInputMiscProps,
      domList: {
        input: VNode;
        errorList: VNode | null;
        extra: VNode | null;
      },
    ) => VueNode;
  };
}

export interface FormItemInputProps {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  extra?: VueNode;
  status?: ValidateStatus;
  help?: VueNode;
  fieldId?: string;
  label?: VueNode;
}

defineOptions({ inheritAttrs: false });

const {
  prefixCls,
  status,
  labelCol,
  wrapperCol,
  errors,
  warnings,
  _internalItemRender: formItemRender,
  extra,
  help,
  fieldId,
  marginBottom,
  onErrorVisibleChanged,
  label,
} = defineProps<FormItemInputProps & FormItemInputMiscProps>();

const slots = defineSlots<{
  default: () => VNode[];
}>();

const GRID_MAX = 24;

const baseClassName = computed(() => `${prefixCls}-item`);

const formContext = useFormContextInject();
const { classNames: contextClassNames, styles: contextStyles } = toRefs(formContext);

const mergedWrapperCol = computed<ColProps>(() => {
  let mergedWrapper: ColProps = { ...(wrapperCol || formContext.wrapperCol || {}) };
  if (label === null && !labelCol && !wrapperCol && formContext.labelCol) {
    const list = [undefined, 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

    list.forEach((size) => {
      const _size = size ? [size] : [];

      const formLabel = get(formContext.labelCol, _size);
      const formLabelObj = typeof formLabel === 'object' ? formLabel : {};

      const wrapper = get(mergedWrapper, _size);
      const wrapperObj = typeof wrapper === 'object' ? wrapper : {};

      if ('span' in formLabelObj && !('offset' in wrapperObj) && formLabelObj.span < GRID_MAX) {
        mergedWrapper = set(mergedWrapper, [..._size, 'offset'], formLabelObj.span);
      }
    });
  }
  return mergedWrapper;
});

const className = computed(() => clsx(`${baseClassName.value}-control`, mergedWrapperCol.value.class));

// Pass to sub FormItem should not with col info
const subFormContext = computed(() => {
  const { labelCol: _, wrapperCol: _1, ...rest } = formContext;
  return rest;
});

const extraRef = ref<HTMLDivElement>();
const extraHeight = ref(0);

watch(
  [() => extra, extraRef],
  () => {
    if (extra && extraRef.value) {
      extraHeight.value = extraRef.value.clientHeight;
    } else {
      extraHeight.value = 0;
    }
  },
  { flush: 'post' },
);

const InputDom = () => {
  const slotContent = slots.default?.();
  // Ensure slotContent is valid (not undefined) before rendering
  if (!slotContent) return null;

  return (
    <div class={`${baseClassName.value}-control-input`}>
      <div
        class={clsx(`${baseClassName.value}-control-input-content`, contextClassNames?.value?.content)}
        style={contextStyles?.value?.content}
      >
        {slotContent}
      </div>
    </div>
  );
};

const formItemContext = computed(() => ({ prefixCls, status }));

const ErrorListDom = () => {
  const hasContent = marginBottom !== null || errors.length || warnings.length;
  if (!hasContent) return null;

  return (
    <FormItemPrefixContextProvider value={formItemContext.value}>
      <ErrorList
        fieldId={fieldId}
        errors={errors}
        warnings={warnings}
        help={help}
        helpStatus={status}
        class={`${baseClassName.value}-explain-connected`}
        onVisibleChanged={onErrorVisibleChanged}
      />
    </FormItemPrefixContextProvider>
  );
};

const extraProps = computed(() => {
  const result: { id?: string } = {};
  if (fieldId) {
    result.id = `${fieldId}_extra`;
  }
  return result;
});

const ExtraDom = () => {
  if (!extra) return null;
  return (
    <div {...extraProps.value} class={`${baseClassName.value}-extra`} ref={extraRef}>
      <Render content={extra}></Render>
    </div>
  );
};

const AdditionalDom = () => {
  const hasContent = ErrorListDom() || ExtraDom();
  if (!hasContent) return null;

  return (
    <div
      class={`${baseClassName.value}-additional`}
      style={marginBottom ? { minHeight: `${marginBottom + extraHeight.value}px` } : {}}
    >
      <ErrorListDom></ErrorListDom>
      <ExtraDom></ExtraDom>
    </div>
  );
};
const vm = getCurrentInstance();
const Dom = () => {
  if (formItemRender && formItemRender.mark === 'pro_table_render' && formItemRender.render) {
    return formItemRender.render(vm.props as any, {
      input: <InputDom></InputDom>,
      errorList: <ErrorListDom></ErrorListDom>,
      extra: <ExtraDom></ExtraDom>,
    });
  }
  return (
    <>
      <InputDom></InputDom>
      <AdditionalDom></AdditionalDom>
    </>
  );
};
</script>

<template>
  <FormContextProvider :value="subFormContext">
    <Col v-bind="mergedWrapperCol" :class="className">
      <Dom />
    </Col>
    <FallbackCmp :prefix-cls="prefixCls" />
  </FormContextProvider>
</template>
