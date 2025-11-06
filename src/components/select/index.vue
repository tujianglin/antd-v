<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs } from 'vue';
import type { BaseSelectRef, SelectProps as RcSelectProps } from '@/vc-component/select';
import RcSelect from '@/vc-component/select';
import type { OptionProps } from '@/vc-component/select/Option.vue';
import {
  useMergeSemantic,
  type SemanticClassNames,
  type SemanticClassNamesType,
  type SemanticStyles,
  type SemanticStylesType,
} from '../_util/hooks';
import { useZIndex } from '../_util/hooks/useZIndex';
import type { SelectCommonPlacement } from '../_util/motion';
import { getTransitionName } from '../_util/motion';
import type { InputStatus } from '../_util/statusUtils';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import useVariants from '../form/hooks/useVariants';
import { useToken } from '../theme/internal';
import useStyle from './style';
import useIcons from './useIcons';
import usePopupRender from './usePopupRender';
import type { BaseOptionType, DefaultOptionType } from '@/vc-component/select/interface';
import type { VueNode } from '@/vc-util/type';
import { useCompactItemContext } from '../space/CompactContext';
import { useFormItemInputContextInject } from '../form/context';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty.vue';
import { reactiveComputed } from '@vueuse/core';
import { omit } from 'lodash-es';
import clsx from 'clsx';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import mergedBuiltinPlacements from './mergedBuiltinPlacements';

type RawValue = string | number;

export type { BaseOptionType, DefaultOptionType, OptionProps, BaseSelectRef as RefSelectProps };

export interface LabeledValue {
  key?: string;
  value: RawValue;
  label: VueNode;
}

export type SelectValue = RawValue | RawValue[] | LabeledValue | LabeledValue[] | undefined;

export interface InternalSelectProps<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>
  extends Omit<RcSelectProps<ValueType, OptionType>, 'mode'> {
  rootClassName?: string;
  prefix?: VueNode;
  suffixIcon?: VueNode;
  size?: SizeType;
  disabled?: boolean;
  mode?: 'multiple' | 'tags' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE' | 'combobox';
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
  classNames?: SemanticClassNames<SemanticName> & { popup?: SemanticClassNames<PopupSemantic> };
  styles?: SemanticStyles<SemanticName> & { popup?: SemanticStyles<PopupSemantic> };
}

type SemanticName = 'root' | 'prefix' | 'suffix';
type PopupSemantic = 'root' | 'listItem' | 'list';

export type SelectClassNamesType = SemanticClassNamesType<
  SelectProps,
  SemanticName,
  { popup?: SemanticClassNames<PopupSemantic> }
>;

export type SelectStylesType = SemanticStylesType<SelectProps, SemanticName, { popup?: SemanticStyles<PopupSemantic> }>;

export interface SelectProps<ValueType = any, OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>
  extends Omit<
    InternalSelectProps<ValueType, OptionType>,
    'mode' | 'getInputElement' | 'getRawInputElement' | 'backfill' | 'placement' | 'dropdownClassName' | 'dropdownStyle'
  > {
  placement?: SelectCommonPlacement;
  mode?: 'multiple' | 'tags';
  status?: InputStatus;
  popupMatchSelectWidth?: boolean | number;
  styles?: SelectStylesType;
  classNames?: SelectClassNamesType;
  onOpenChange?: (visible: boolean) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  getPopupContainer,
  popupClassName,
  listHeight = 256,
  placement,
  listItemHeight: customListItemHeight,
  size: customizeSize,
  disabled: customDisabled = undefined,
  notFoundContent,
  status: customStatus,
  builtinPlacements,
  popupMatchSelectWidth = true,
  direction: propDirection,
  style,
  allowClear = undefined,
  variant: customizeVariant,
  popupStyle,
  transitionName,
  tagRender,
  maxCount,
  prefix,
  popupRender,
  onOpenChange,
  styles,
  classNames,
  virtual: customizeVirtual = true,
  ...rest
} = defineProps<SelectProps>();

const value = defineModel('value');
const open = defineModel('open', { default: false });

const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';

const {
  getPopupContainer: getContextPopupContainer,
  getPrefixCls,
  renderEmpty,
  direction: contextDirection,
  virtual,
  popupMatchSelectWidth: contextPopupMatchSelectWidth,
  popupOverflow,
} = toRefs(useConfigContextInject());

const {
  showSearch,
  style: contextStyle,
  styles: contextStyles,
  class: contextClassName,
  classNames: contextClassNames,
} = toRefs(useComponentConfig('select'));

const [, token] = useToken();

const listItemHeight = computed(() => customListItemHeight ?? token?.value?.controlHeight);

const prefixCls = computed(() => getPrefixCls.value('select', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());
const direction = computed(() => propDirection ?? contextDirection?.value);

const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

const [variant, enableVariantCls] = useVariants(
  'select',
  computed(() => customizeVariant),
);

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const mode = computed(() => {
  const { mode: m } = rest as InternalSelectProps<DefaultOptionType>;

  if (m === 'combobox') {
    return undefined;
  }

  if (m === SECRET_COMBOBOX_MODE_DO_NOT_USE) {
    return 'combobox';
  }

  return m;
});

const isMultiple = computed(() => mode.value === 'multiple' || mode.value === 'tags');

const mergedPopupMatchSelectWidth = computed(() => popupMatchSelectWidth ?? contextPopupMatchSelectWidth?.value);

const mergedPopupRender = usePopupRender(computed(() => popupRender));

// ===================== Form Status =====================
const { status: contextStatus, hasFeedback, isFormItemInput, feedbackIcon } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));

// ===================== Empty =====================
const mergedNotFound = computed(() => {
  let result;
  if (notFoundContent !== undefined) {
    result = notFoundContent;
  } else if (mode.value === 'combobox') {
    result = null;
  } else {
    result = renderEmpty?.value?.('Select') || <DefaultRenderEmpty componentName="Select" />;
  }
  return result;
});

// ===================== Icons =====================
// @ts-ignore
const { suffixIcon, itemIcon, removeIcon, clearIcon } = useIcons(
  reactiveComputed(() => ({
    ...rest,
    multiple: isMultiple.value,
    hasFeedback: hasFeedback?.value,
    feedbackIcon: feedbackIcon?.value,
    prefixCls: prefixCls.value,
    componentName: 'Select',
  })),
);

const mergedAllowClear = computed(() => (allowClear === true ? { clearIcon: clearIcon?.value } : allowClear));

const selectProps = computed(() => omit(rest, ['suffixIcon', 'itemIcon' as any]));

const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize.value ?? ctx));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<SelectClassNamesType, SelectStylesType, SelectProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      variant: variant.value,
      status: mergedStatus.value,
      disabled: mergedDisabled.value,
      size: mergedSize.value,
    } as SelectProps,
  })),
  computed(() => ({
    popup: {
      _default: 'root',
    },
  })),
);

const mergedPopupClassName = computed(() =>
  clsx(
    mergedClassNames?.value?.popup?.root,
    popupClassName,
    {
      [`${prefixCls.value}-dropdown-${direction.value}`]: direction?.value === 'rtl',
    },
    rootClassName,
    cssVarCls.value,
    rootCls.value,
    hashId.value,
  ),
);

const mergedClassName = computed(() =>
  clsx(
    {
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-${variant.value}`]: enableVariantCls?.value,
      [`${prefixCls.value}-in-form-item`]: isFormItemInput?.value,
    },
    getStatusClassNames(prefixCls.value, mergedStatus.value, hasFeedback?.value),
    compactItemClassnames?.value,
    contextClassName?.value,
    className,
    mergedClassNames?.value?.root,
    rootClassName,
    cssVarCls.value,
    rootCls.value,
    hashId.value,
  ),
);

// ===================== Placement =====================
const memoPlacement = computed<SelectCommonPlacement>(() => {
  if (placement !== undefined) {
    return placement;
  }
  return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
});

// ====================== zIndex =========================
const [zIndex] = useZIndex(
  'SelectLike',
  computed(() => (mergedStyles?.value?.popup?.root?.zIndex as number) ?? (popupStyle?.zIndex as number)),
);
</script>
<template>
  <RcSelect
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :show-search="showSearch"
    v-bind="{ ...selectProps, ...$attrs }"
    :virtual="virtual || customizeVirtual"
    v-model:value="value"
    v-model:open="open"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    :popup-match-select-width="mergedPopupMatchSelectWidth"
    :transition-name="getTransitionName(rootPrefixCls, 'slide-up', transitionName)"
    :builtin-placements="mergedBuiltinPlacements(builtinPlacements, popupOverflow)"
    :list-height="listHeight"
    :list-item-height="listItemHeight"
    :mode="mode"
    :prefix-cls="prefixCls"
    :placement="memoPlacement"
    :direction="direction"
    :prefix="prefix"
    :suffix-icon="suffixIcon"
    :menu-item-selected-icon="itemIcon"
    :remove-icon="removeIcon"
    :allow-clear="mergedAllowClear"
    :not-found-content="mergedNotFound"
    :class="mergedClassName"
    :get-popup-container="getPopupContainer || getContextPopupContainer"
    :popup-class-name="mergedPopupClassName"
    :disabled="mergedDisabled"
    :popup-style="{ ...mergedStyles.popup?.root, ...popupStyle, zIndex }"
    :max-count="isMultiple ? maxCount : undefined"
    :tag-render="isMultiple ? tagRender : undefined"
    :popup-render="mergedPopupRender"
    @popup-visible-change="onOpenChange"
  />
</template>
