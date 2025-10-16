<script lang="tsx" setup>
import type {
  BaseOptionType,
  DefaultOptionType,
  FieldNames,
  CascaderProps as RcCascaderProps,
  SearchConfig,
} from '@/vc-component/cascader';
import RcCascader from '@/vc-component/cascader';

import useMergeSemantic from '../_util/hooks/useMergeSemantic';
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
import useBase from './hooks/useBase';
import useCheckable from './hooks/useCheckable';
import useColumnIcons from './hooks/useColumnIcons';
import useStyle from './style';
import type { VueNode } from '@/vc-util/type';
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import { useFormItemInputContextInject } from '../form/context';
import { useCompactItemContext } from '../space/CompactContext';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty.vue';
import clsx from 'clsx';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { reactiveComputed } from '@vueuse/core';
import type { Placement } from '@/vc-component/select/interface';
import { omit } from 'lodash-es';
import mergedBuiltinPlacements from '../select/mergedBuiltinPlacements';
import type { SingleValueType } from '@/vc-component/cascader/Cascader.vue';

// Align the design since we use `@rc-component/select` in root. This help:
// - List search content will show all content
// - Hover opacity style
// - Search filter match case

export type { BaseOptionType, DefaultOptionType };

export type FieldNamesType = FieldNames;

export type FilledFieldNamesType = Required<FieldNamesType>;

type SemanticName = 'root' | 'prefix' | 'suffix';
type PopupSemantic = 'root' | 'listItem' | 'list';

export interface CascaderProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean = boolean,
> extends Omit<
    RcCascaderProps<OptionType, ValueField, Multiple>,
    'checkable' | 'classNames' | 'styles' | 'onPopupVisibleChange'
  > {
  multiple?: Multiple;
  size?: SizeType;
  disabled?: boolean;
  placement?: SelectCommonPlacement;
  suffixIcon?: VueNode;
  options?: OptionType[];
  status?: InputStatus;

  rootClassName?: string;
  popupRender?: (menu: any) => any;
  popupMenuColumnStyle?: CSSProperties;
  onOpenChange?: (visible: boolean) => void;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
}
export type CascaderAutoProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
> =
  | (CascaderProps<OptionType, ValueField> & { multiple?: false })
  | (CascaderProps<OptionType, ValueField, true> & { multiple: true });

export interface CascaderRef {
  focus: () => void;
  blur: () => void;
}

defineOptions({ name: 'Cascader', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  size: customizeSize,
  disabled: customDisabled,
  class: className,
  rootClassName,
  multiple,
  transitionName,
  choiceTransitionName = '',
  popupClassName,
  expandIcon,
  placement,
  showSearch,
  allowClear = true,
  notFoundContent,
  direction,
  getPopupContainer,
  status: customStatus,
  builtinPlacements,
  style,
  variant: customVariant,
  popupRender,
  popupMenuColumnStyle,
  onOpenChange,
  styles,
  classNames,
  ...rest
} = defineProps<CascaderAutoProps>();

const value = defineModel<SingleValueType[]>('value');

function highlightKeyword(str: string, lowerKeyword: string, prefixCls?: string) {
  const cells = str
    .toLowerCase()
    .split(lowerKeyword)
    .reduce<string[]>((list, cur, index) => (index === 0 ? [cur] : [...list, lowerKeyword, cur]), []);
  const fillCells: VueNode[] = [];
  let start = 0;

  cells.forEach((cell, index) => {
    const end = start + cell.length;
    let originWorld: VueNode = str.slice(start, end);
    start = end;

    if (index % 2 === 1) {
      originWorld = (
        <span class={`${prefixCls}-menu-item-keyword`} key={`separator-${index}`}>
          {originWorld}
        </span>
      );
    }

    fillCells.push(originWorld);
  });

  return fillCells;
}

const defaultSearchRender: SearchConfig['render'] = (inputValue, path, prefixCls, fieldNames) => {
  const optionList: VueNode[] = [];

  // We do lower here to save perf
  const lower = inputValue.toLowerCase();

  path.forEach((node, index) => {
    if (index !== 0) {
      optionList.push(' / ');
    }

    let label = node[fieldNames.label!];
    const type = typeof label;
    if (type === 'string' || type === 'number') {
      label = highlightKeyword(String(label), lower, prefixCls);
    }

    optionList.push(label);
  });
  return optionList;
};

const {
  getPrefixCls,
  getPopupContainer: getContextPopupContainer,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('cascader'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    popup: {
      _default: 'root',
    },
  })),
);

const { popupOverflow } = toRefs(useConfigContextInject());

// =================== Form =====================
const { status: contextStatus, hasFeedback, isFormItemInput, feedbackIcon } = toRefs(useFormItemInputContextInject());
const mergedStatus = computed(() => getMergedStatus(contextStatus?.value, customStatus));

// ==================== Prefix =====================
const [prefixCls, cascaderPrefixCls, mergedDirection, renderEmpty] = useBase(
  computed(() => customizePrefixCls),
  computed(() => direction),
);
const isRtl = computed(() => mergedDirection.value === 'rtl');

const rootPrefixCls = computed(() => getPrefixCls.value());

const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useSelectStyle(prefixCls, rootCls);
const cascaderRootCls = useCSSVarCls(cascaderPrefixCls);
useStyle(cascaderPrefixCls, cascaderRootCls);

const { compactSize, compactItemClassnames } = useCompactItemContext(
  prefixCls,
  computed(() => direction),
);

const [variant, enableVariantCls] = useVariant(
  'cascader',
  computed(() => customVariant),
);

// =================== No Found ====================
const mergedNotFoundContent = computed(
  () => notFoundContent || renderEmpty?.value?.('Cascader') || <DefaultRenderEmpty componentName="Cascader" />,
);

// =================== Dropdown ====================
const mergedPopupClassName = computed(() =>
  clsx(
    popupClassName,
    `${cascaderPrefixCls.value}-dropdown`,
    {
      [`${cascaderPrefixCls.value}-dropdown-rtl`]: mergedDirection.value === 'rtl',
    },
    rootClassName,
    rootCls.value,
    mergedClassNames?.value?.popup?.root,
    mergedClassNames?.value?.root,
    cascaderRootCls.value,
    hashId.value,
    cssVarCls.value,
  ),
);

const mergedPopupRender = usePopupRender(computed(() => popupRender));

const mergedPopupStyle = computed(() => mergedStyles?.value.popup?.root);

// ==================== Search =====================
const mergedShowSearch = computed(() => {
  if (!showSearch) {
    return showSearch;
  }

  let searchConfig: SearchConfig = {
    render: defaultSearchRender,
  };

  if (typeof showSearch === 'object') {
    searchConfig = {
      ...searchConfig,
      ...showSearch,
    };
  }

  return searchConfig;
});

// ===================== Size ======================
const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? compactSize ?? ctx));

// ===================== Disabled =====================
const disabled = useDisabledContextInject();
const mergedDisabled = computed(() => customDisabled ?? disabled.value);

// ===================== Icon ======================
const [mergedExpandIcon, loadingIcon] = useColumnIcons(prefixCls, isRtl, expandIcon);

// =================== Multiple ====================
const checkable = useCheckable(
  cascaderPrefixCls,
  computed(() => multiple),
);

// ===================== Icons =====================
const showSuffixIcon = useShowArrow(computed(() => rest.suffixIcon));
const vm = getCurrentInstance();
const { suffixIcon, removeIcon, clearIcon } = useIcons(
  reactiveComputed(() => ({
    ...vm.props,
    hasFeedback: hasFeedback?.value,
    feedbackIcon: feedbackIcon?.value,
    showSuffixIcon: showSuffixIcon?.value,
    multiple,
    prefixCls: prefixCls.value,
    componentName: 'Cascader',
  })),
);

// ===================== Placement =====================
const memoPlacement = computed<Placement>(() => {
  if (placement !== undefined) {
    return placement;
  }
  return isRtl.value ? 'bottomRight' : 'bottomLeft';
});

const mergedAllowClear = computed(() => (allowClear === true ? { clearIcon: clearIcon.value } : allowClear));

// ============================ zIndex ============================
const [zIndex] = useZIndex(
  'SelectLike',
  computed(() => mergedPopupStyle?.value?.zIndex as number),
);

const restProps = computed(() => omit(rest, ['suffixIcon']) as any);
</script>
<template>
  <RcCascader
    v-bind="restProps"
    v-model:value="value"
    :prefix-cls="prefixCls"
    :class="
      clsx(
        !customizePrefixCls && cascaderPrefixCls,
        {
          [`${prefixCls}-lg`]: mergedSize === 'large',
          [`${prefixCls}-sm`]: mergedSize === 'small',
          [`${prefixCls}-rtl`]: isRtl,
          [`${prefixCls}-${variant}`]: enableVariantCls,
          [`${prefixCls}-in-form-item`]: isFormItemInput,
        },
        getStatusClassNames(prefixCls, mergedStatus, hasFeedback),
        compactItemClassnames,
        contextClassName,
        className,
        rootClassName,
        mergedClassNames.root,
        rootCls,
        cascaderRootCls,
        hashId,
        cssVarCls,
      )
    "
    :disabled="mergedDisabled"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :builtin-placements="mergedBuiltinPlacements(builtinPlacements, popupOverflow)"
    :direction="mergedDirection"
    :placement="memoPlacement"
    :not-found-content="mergedNotFoundContent"
    :allow-clear="mergedAllowClear"
    :show-search="mergedShowSearch"
    :expand-icon="mergedExpandIcon"
    :suffix-icon="suffixIcon"
    :remove-icon="removeIcon"
    :loading-icon="loadingIcon"
    :checkable="checkable"
    :popup-class-name="mergedPopupClassName"
    :popup-prefix-cls="customizePrefixCls || cascaderPrefixCls"
    :popup-style="{ ...mergedPopupStyle, zIndex }"
    :popup-render="mergedPopupRender"
    :popup-menu-column-style="popupMenuColumnStyle"
    @popup-visible-change="onOpenChange"
    :choice-transition-name="getTransitionName(rootPrefixCls, '', choiceTransitionName)"
    :transition-name="getTransitionName(rootPrefixCls, 'slide-up', transitionName)"
    :get-popup-container="getPopupContainer || getContextPopupContainer"
  />
</template>
