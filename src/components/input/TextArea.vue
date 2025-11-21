<script lang="tsx" setup>
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { computed, getCurrentInstance, h, ref, toRefs, useTemplateRef } from 'vue';
import { triggerFocus } from '.';
import type { TextAreaProps as VcTextAreaProps } from '../../vc-component/textarea';
import VcTextArea from '../../vc-component/textarea';
import getAllowClear from '../_util/getAllowClear';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { getMergedStatus, getStatusClassNames, type InputStatus } from '../_util/statusUtils';
import { useComponentConfig, type Variant } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import { useFormItemInputContextInject } from '../form/context';
import useVariant from '../form/hooks/useVariants';
import { useCompactItemContext } from '../space/CompactContext';
import type { InputFocusOptions } from './Input.vue';
import { useSharedStyle } from './style';
import useStyle from './style/textarea';

type SemanticName = 'root' | 'textarea' | 'count';

export type TextAreaClassNamesType = SemanticClassNamesType<TextAreaProps, SemanticName>;

export type TextAreaStylesType = SemanticStylesType<TextAreaProps, SemanticName>;

export interface TextAreaProps extends Omit<VcTextAreaProps, 'suffix' | 'classNames' | 'styles'> {
  size?: SizeType;
  status?: InputStatus;
  rootClassName?: string;
  variant?: Variant;
  classNames?: TextAreaClassNamesType;
  styles?: TextAreaStylesType;
}

defineOptions({ name: 'InputTextArea', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  size: customizeSize,
  disabled: customDisabled = undefined,
  status: customStatus,
  allowClear,
  classNames,
  rootClassName,
  class: className,
  style,
  styles,
  variant: customVariant,
  showCount,
  ...rest
} = defineProps<TextAreaProps>();

const emits = defineEmits<{
  mousedown: [MouseEvent];
  resize: [{ width: number; height: number }];
}>();

const value = defineModel<string>('value');

const {
  getPrefixCls,
  direction,
  allowClear: contextAllowClear,
  autoComplete: contextAutoComplete,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('textArea'));

// =================== Disabled ===================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

// ==================== Status ====================
const { status: contextStatus, hasFeedback, feedbackIcon } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));

const vm = getCurrentInstance();
const [mergedClassNames, mergedStyles] = useMergeSemantic<TextAreaClassNamesType, TextAreaStylesType, TextAreaProps>(
  computed(() => [contextClassNames.value, classNames]),
  computed(() => [contextStyles.value, styles]),
  computed(() => ({ props: vm.props })),
);
// ===================== Ref ======================
const innerRef = useTemplateRef('innerRef');
defineExpose({
  get resizableTextArea() {
    return innerRef.value?.resizableTextArea;
  },
  focus: (option?: InputFocusOptions) => {
    triggerFocus(innerRef.value?.resizableTextArea?.textArea, option);
  },
  blur: () => innerRef.value?.blur(),
});

const prefixCls = computed(() => getPrefixCls.value('input', customizePrefixCls));

// ==================== Style =====================
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useSharedStyle(
  prefixCls,
  computed(() => rootClassName),
);
useStyle(prefixCls, rootCls);

// ================= Compact Item =================
const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

// ===================== Size =====================
const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize.value ?? ctx));

const [variant, enableVariantCls] = useVariant(
  'textArea',
  computed(() => customVariant),
);

const mergedAllowClear = computed(() => getAllowClear(allowClear ?? (contextAllowClear.value as any)));

// ==================== Resize ====================
// https://github.com/ant-design/ant-design/issues/51594
const isMouseDown = ref(false);

// When has wrapper, resize will make as dirty for `resize: both` style
const resizeDirty = ref(false);

function onInternalMouseDown(e: MouseEvent) {
  isMouseDown.value = true;
  emits('mousedown', e);

  const onMouseUp = () => {
    isMouseDown.value = false;
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mouseup', onMouseUp);
}

const onInternalResize: VcTextAreaProps['onResize'] = (size) => {
  emits('resize', size);

  // Change to dirty since this maybe from the `resize: both` style
  if (isMouseDown.value && typeof getComputedStyle === 'function') {
    const ele = innerRef.value?.nativeElement;
    if (ele && getComputedStyle(ele).resize === 'both') {
      resizeDirty.value = true;
    }
  }
};
</script>
<template>
  <VcTextArea
    :auto-complete="contextAutoComplete"
    v-bind="{ ...rest, ...$attrs }"
    v-model:value="value"
    ref="innerRef"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    :styles="mergedStyles"
    :disabled="mergedDisabled"
    :allow-clear="mergedAllowClear"
    :class="
      clsx(
        cssVarCls,
        rootCls,
        className,
        rootClassName,
        compactItemClassnames,
        contextClassName,
        mergedClassNames.root,
        // Only for wrapper
        resizeDirty && `${prefixCls}-textarea-affix-wrapper-resize-dirty`,
      )
    "
    :class-names="{
      ...mergedClassNames,
      textarea: clsx(
        {
          [`${prefixCls}-sm`]: mergedSize === 'small',
          [`${prefixCls}-lg`]: mergedSize === 'large',
        },
        hashId,
        mergedClassNames.textarea,
        isMouseDown && `${prefixCls}-mouse-active`,
      ),
      variant: clsx(
        {
          [`${prefixCls}-${variant}`]: enableVariantCls,
        },
        getStatusClassNames(prefixCls, mergedStatus),
      ),
      affixWrapper: clsx(
        `${prefixCls}-textarea-affix-wrapper`,
        {
          [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl',
          [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
          [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
          [`${prefixCls}-textarea-show-count`]: showCount || count?.show,
        },
        hashId,
      ),
    }"
    :prefix-cls="prefixCls"
    :suffix="hasFeedback && h('span', { class: `${prefixCls}-textarea-suffix` }, () => h(Render, { content: feedbackIcon }))"
    :show-count="showCount"
    @resize="onInternalResize"
    @mousedown="onInternalMouseDown"
  />
</template>
