<script lang="tsx" setup>
import { computed, getCurrentInstance, h, toRefs, type AriaAttributes, type CSSProperties } from 'vue';
import type { TreeSelectProps as RcTreeSelectProps } from '@/vc-component/tree-select';
import RcTreeSelect from '@/vc-component/tree-select';
import {
  useMergeSemantic,
  type SemanticClassNames,
  type SemanticClassNamesType,
  type SemanticStyles,
  type SemanticStylesType,
} from '../_util/hooks';
import { useZIndex } from '../_util/hooks/useZIndex';
import { getTransitionName, type SelectCommonPlacement } from '../_util/motion';
import type { InputStatus } from '../_util/statusUtils';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import type { Variant } from '../config-provider';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import useVariant from '../form/hooks/useVariants';
import useSelectStyle from '../select/style';
import useIcons from '../select/useIcons';
import usePopupRender from '../select/usePopupRender';
import useShowArrow from '../select/useShowArrow';
import { useToken } from '../theme/internal';
import type { AntTreeNodeProps, TreeProps } from '../tree';
import type { SwitcherIcon } from '../tree/Tree.vue';
import SwitcherIconCom from '../tree/utils/iconUtil';
import useStyle from './style';
import type { VueNode } from '@/vc-util/type';
import type { DataNode } from '@/vc-component/tree-select/interface';
import { useCompactItemContext } from '../space/CompactContext';
import clsx from 'clsx';
import { useFormItemInputContextInject } from '../form/context';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty.vue';
import { omit } from 'es-toolkit/compat';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import type { Placement } from '@/vc-component/select/interface';
import mergedBuiltinPlacements from '../select/mergedBuiltinPlacements';
import { reactiveComputed } from '@vueuse/core';

type RawValue = string | number;

export interface LabeledValue {
  key?: string;
  value: RawValue;
  label: VueNode;
}

export type SelectValue = RawValue | RawValue[] | LabeledValue | LabeledValue[];

type SemanticName = 'root' | 'prefix' | 'input' | 'suffix' | 'content' | 'placeholder' | 'item' | 'itemContent' | 'itemRemove';
type PopupSemantic = 'item' | 'itemTitle' | 'root';

export type TreeSelectClassNamesType = SemanticClassNamesType<TreeSelectProps, SemanticName> & {
  popup?: SemanticClassNames<PopupSemantic>;
};

export type TreeSelectStylesType = SemanticStylesType<TreeSelectProps, SemanticName> & {
  popup?: SemanticStyles<PopupSemantic>;
};

export interface TreeSelectProps<ValueType = any, OptionType extends DataNode = DataNode>
  extends /** @vue-ignore */ AriaAttributes,
    Omit<
      RcTreeSelectProps<ValueType, OptionType>,
      'showTreeIcon' | 'treeMotion' | 'mode' | 'getInputElement' | 'backfill' | 'treeLine' | 'switcherIcon'
    > {
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  suffixIcon?: VueNode;
  size?: SizeType;
  disabled?: boolean;
  placement?: SelectCommonPlacement;
  popupRender?: (menu: VueNode) => VueNode;
  onOpenChange?: (open: boolean) => void;
  treeLine?: TreeProps['showLine'];
  status?: InputStatus;
  switcherIcon?: SwitcherIcon | RcTreeSelectProps<ValueType, OptionType>['switcherIcon'];
  rootClassName?: string;
  popupMatchSelectWidth?: boolean | number;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
}

defineOptions({ name: 'TreeSelect', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  size: customizeSize,
  disabled: customDisabled = undefined,
  style,
  class: className,
  rootClassName,
  treeCheckable,
  multiple,
  listHeight = 256,
  listItemHeight: customListItemHeight,
  placement,
  notFoundContent,
  switcherIcon: customSwitcherIcon,
  treeLine,
  getPopupContainer,
  popupClassName,
  treeIcon = false,
  transitionName,
  choiceTransitionName = '',
  status: customStatus,
  treeExpandAction,
  builtinPlacements,
  popupMatchSelectWidth = undefined,
  allowClear,
  variant: customVariant,
  popupRender,
  onOpenChange,
  tagRender,
  maxCount,
  showCheckedStrategy,
  treeCheckStrictly,
  styles,
  classNames,
  virtual: customVirtual = true,
  ...restProps
} = defineProps<TreeSelectProps>();

const value = defineModel('value');
const open = defineModel('open', { default: false });

const {
  getPrefixCls,
  getPopupContainer: getContextPopupContainer,
  direction,
  styles: contextStyles,
  classNames: contextClassNames,
  switcherIcon,
} = toRefs(useComponentConfig('treeSelect'));
const {
  renderEmpty,
  virtual,
  popupMatchSelectWidth: contextPopupMatchSelectWidth,
  popupOverflow,
} = toRefs(useConfigContextInject());

const [, token] = useToken();
const listItemHeight = computed(() => customListItemHeight ?? token?.value?.controlHeightSM + token?.value?.paddingXXS);

const rootPrefixCls = computed(() => getPrefixCls.value());
const prefixCls = computed(() => getPrefixCls.value('select', customizePrefixCls));
const treePrefixCls = computed(() => getPrefixCls.value('select-tree', customizePrefixCls));
const treeSelectPrefixCls = computed(() => getPrefixCls.value('tree-select', customizePrefixCls));
const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

const rootCls = useCSSVarCls(prefixCls);
const treeSelectRootCls = useCSSVarCls(treeSelectPrefixCls);
const [hashId, cssVarCls] = useSelectStyle(prefixCls, rootCls);
useStyle(treeSelectPrefixCls, treePrefixCls.value, treeSelectRootCls);

const [variant, enableVariantCls] = useVariant(
  'treeSelect',
  computed(() => customVariant),
);

const mergedPopupRender = usePopupRender(computed(() => popupRender));

const isMultiple = computed(() => !!(treeCheckable || multiple));

const mergedMaxCount = computed(() => {
  if (maxCount && ((showCheckedStrategy === 'SHOW_ALL' && !treeCheckStrictly) || showCheckedStrategy === 'SHOW_PARENT')) {
    return undefined;
  }
  return maxCount;
});

const showSuffixIcon = useShowArrow(computed(() => restProps.suffixIcon));

const mergedPopupMatchSelectWidth = computed(() => popupMatchSelectWidth ?? contextPopupMatchSelectWidth?.value);

// ===================== Form =====================
const { status: contextStatus, hasFeedback, isFormItemInput, feedbackIcon } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));

// ===================== Icons =====================
const { suffixIcon, removeIcon, clearIcon } = useIcons(
  reactiveComputed(() => ({
    ...restProps,
    multiple: isMultiple.value,
    showSuffixIcon: showSuffixIcon?.value,
    hasFeedback: hasFeedback?.value,
    feedbackIcon: feedbackIcon?.value,
    prefixCls: prefixCls?.value,
    componentName: 'TreeSelect',
  })),
);

const mergedAllowClear = computed(() => (allowClear === true ? { clearIcon: clearIcon.value } : allowClear));

// ===================== Empty =====================
const mergedNotFound = computed(() => {
  let result;
  if (notFoundContent !== undefined) {
    result = notFoundContent;
  } else {
    result = renderEmpty?.value?.('Select') || <DefaultRenderEmpty componentName="Select" />;
  }
  return result;
});
// ==================== Render =====================
const selectProps = computed(() =>
  omit(restProps, ['suffixIcon', 'removeIcon', 'clearIcon', 'itemIcon' as any, 'switcherIcon' as any, 'style']),
);

// ===================== Placement =====================
const memoizedPlacement = computed<Placement>(() => {
  if (placement !== undefined) {
    return placement;
  }
  return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
});

const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize?.value ?? ctx));

// ===================== Disabled =====================
// eslint-disable-next-line vue/no-dupe-keys
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<TreeSelectClassNamesType, TreeSelectStylesType, TreeSelectProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
      disabled: mergedDisabled.value,
      status: mergedStatus.value,
      variant: variant.value,
    } as TreeSelectProps,
  })),
  computed(() => ({
    popup: {
      _default: 'root',
    },
  })),
);

const mergedPopupClassName = computed(() =>
  clsx(
    popupClassName,
    `${treeSelectPrefixCls.value}-dropdown`,
    {
      [`${treeSelectPrefixCls.value}-dropdown-rtl`]: direction?.value === 'rtl',
    },
    rootClassName,
    mergedClassNames?.value?.root,
    mergedClassNames?.value?.popup?.root,
    cssVarCls.value,
    rootCls.value,
    treeSelectRootCls.value,
    hashId.value,
  ),
);

const mergedClassName = computed(() =>
  clsx(
    !customizePrefixCls && treeSelectPrefixCls.value,
    {
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-${variant?.value}`]: enableVariantCls?.value,
      [`${prefixCls.value}-in-form-item`]: isFormItemInput?.value,
    },
    getStatusClassNames(prefixCls.value, mergedStatus.value, hasFeedback?.value),
    compactItemClassnames.value,
    className,
    rootClassName,
    mergedClassNames?.value?.root,
    cssVarCls.value,
    rootCls.value,
    treeSelectRootCls.value,
    hashId.value,
  ),
);

const mergedSwitcherIcon = computed(() => customSwitcherIcon ?? switcherIcon?.value);

const renderSwitcherIcon = (nodeProps: AntTreeNodeProps) => (
  <SwitcherIconCom
    prefixCls={treePrefixCls.value}
    switcherIcon={mergedSwitcherIcon.value as SwitcherIcon}
    treeNodeProps={nodeProps}
    showLine={treeLine}
  />
);

// ============================ zIndex ============================
const [zIndex] = useZIndex(
  'SelectLike',
  computed(() => mergedStyles?.value?.popup?.root?.zIndex as number),
);
</script>
<template>
  <RcTreeSelect
    v-bind="selectProps"
    v-model:value="value"
    v-model:open="open"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :virtual="customVirtual ?? virtual"
    :disabled="mergedDisabled"
    :popup-match-select-width="mergedPopupMatchSelectWidth"
    :builtin-placements="mergedBuiltinPlacements(builtinPlacements, popupOverflow)"
    :prefix-cls="prefixCls"
    :class="mergedClassName"
    :style="{ ...mergedStyles?.root, ...style }"
    :list-height="listHeight"
    :list-item-height="listItemHeight"
    :tree-checkable="treeCheckable ? h('span', { class: `${prefixCls}-tree-checkbox-inner` }) : treeCheckable"
    :tree-line="!!treeLine"
    :suffix="suffixIcon"
    :multiple="isMultiple"
    :placement="memoizedPlacement"
    :remove-icon="removeIcon"
    :allow-clear="mergedAllowClear"
    :switcher-icon="renderSwitcherIcon"
    :show-tree-icon="treeIcon"
    :not-found-content="mergedNotFound"
    :get-popup-container="getPopupContainer || getContextPopupContainer"
    :tree-motion="null"
    :popup-class-name="mergedPopupClassName"
    :popup-style="{ ...mergedStyles.root, ...mergedStyles.popup?.root, zIndex }"
    :popup-render="mergedPopupRender"
    @popup-visible-change="onOpenChange"
    :choice-transition-name="getTransitionName(rootPrefixCls, '', choiceTransitionName)"
    :transition-name="getTransitionName(rootPrefixCls, 'slide-up', transitionName)"
    :tree-expand-action="treeExpandAction"
    :tag-render="isMultiple ? tagRender : undefined"
    :max-count="mergedMaxCount"
    :show-checked-strategy="showCheckedStrategy"
    :tree-check-strictly="treeCheckStrictly"
  />
</template>
