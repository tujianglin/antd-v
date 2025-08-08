<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, ref, toRefs, type CSSProperties } from 'vue';
import { triggerFocus, type InputFocusOptions } from '../../vc-component/input/utils/commonUtils';
import type { TextAreaProps as VcTextAreaProps, TextAreaRef as VcTextAreaRef } from '../../vc-component/textarea';
import VcTextArea from '../../vc-component/textarea';
import getAllowClear from '../_util/getAllowClear';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import type { InputStatus } from '../_util/statusUtils';
import { useComponentConfig, type Variant } from '../config-provider/context';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import useVariant from '../form/hooks/useVariants';
import { useCompactItemContext } from '../space/CompactContext';
import { useSharedStyle } from './style';
import useStyle from './style/textarea';

type SemanticName = 'root' | 'textarea' | 'count';

export interface TextAreaProps extends Omit<VcTextAreaProps, 'suffix'> {
  size?: SizeType;
  status?: InputStatus;
  rootClassName?: string;
  variant?: Variant;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ name: 'InputTextArea', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  size: customizeSize,
  disabled: customDisabled,
  allowClear,
  classNames,
  rootClassName,
  class: className,
  style,
  styles,
  variant: customVariant,
  showCount,
  onMousedown,
  onResize,
  ...rest
} = defineProps<TextAreaProps>();

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

const { mergedClassNames, mergedStyles } = toRefs(
  useMergeSemantic(
    computed(() => [contextClassNames.value, classNames]),
    computed(() => [contextStyles.value, styles]),
  ),
);
// ===================== Ref ======================
const innerRef = ref<VcTextAreaRef>(null);
defineExpose({
  resizableTextArea: () => innerRef.value?.resizableTextArea(),
  focus: (option?: InputFocusOptions) => {
    triggerFocus(innerRef.value?.resizableTextArea?.()?.textArea(), option);
  },
  blur: () => innerRef.value?.blur(),
});

const prefixCls = getPrefixCls.value('input', customizePrefixCls);

// ==================== Style =====================
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useSharedStyle(prefixCls, rootClassName);
useStyle(prefixCls, rootCls);

// ================= Compact Item =================
const { compactSize, compactItemClassnames } = toRefs(
  useCompactItemContext(
    prefixCls,
    computed(() => direction.value),
  ),
);

// ===================== Size =====================
const mergedSize = computed(() => useSize((ctx) => customizeSize ?? compactSize.value ?? ctx));

const { variant, enableVariantCls } = toRefs(
  useVariant(
    'textArea',
    computed(() => customVariant),
  ),
);

const mergedAllowClear = computed(() => getAllowClear(allowClear ?? (contextAllowClear.value as any)));

// ==================== Resize ====================
// https://github.com/ant-design/ant-design/issues/51594
const isMouseDown = ref(false);

// When has wrapper, resize will make as dirty for `resize: both` style
const resizeDirty = ref(false);

function onInternalMouseDown(e: MouseEvent) {
  isMouseDown.value = true;
  onMousedown?.(e);

  const onMouseUp = () => {
    isMouseDown.value = false;
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mouseup', onMouseUp);
}

const onInternalResize: VcTextAreaProps['onResize'] = (size) => {
  onResize?.(size);

  // Change to dirty since this maybe from the `resize: both` style
  if (isMouseDown.value && typeof getComputedStyle === 'function') {
    const ele = innerRef.value?.nativeElement();
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
      variant: clsx({
        [`${prefixCls}-${variant}`]: enableVariantCls,
      }),
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
    :show-count="showCount"
    @resize="onInternalResize"
    @mousedown="onInternalMouseDown"
  />
</template>
