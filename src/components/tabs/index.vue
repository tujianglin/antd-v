<script lang="tsx" setup>
import { computed, h, toRefs, useTemplateRef, type CSSProperties } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import useAnimateConfig from './hooks/useAnimateConfig';
import useStyle from './style';
import RcTabs, { type TabsProps as RcTabsProps } from '@/vc-component/tabs';
import type { VueNode } from '@/vc-util/type';
import type { EditableConfig, MoreProps, Tab } from '@/vc-component/tabs/interface';
import { toReactive } from '@vueuse/core';
import { CloseOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';

export type TabsType = 'line' | 'card' | 'editable-card';

export type TabPosition = 'top' | 'right' | 'bottom' | 'left';

export type TabPlacement = 'top' | 'end' | 'bottom' | 'start';

type SemanticName = 'root' | 'item' | 'indicator' | 'content' | 'header';

type PopupSemantic = 'root';

export interface TabsRef {
  nativeElement: typeof RcTabs | null;
}

export interface TabsProps extends Omit<RcTabsProps, 'editable' | 'items' | 'classNames' | 'styles' | 'popupClassName'> {
  rootClassName?: string;
  type?: TabsType;
  size?: SizeType;
  hideAdd?: boolean;
  centered?: boolean;
  addIcon?: VueNode;
  moreIcon?: VueNode;
  more?: MoreProps;
  removeIcon?: VueNode;
  tabPlacement?: TabPlacement;
  onEdit?: (e: MouseEvent | KeyboardEvent | string, action: 'add' | 'remove') => void;
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>;
  };
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>;
  };
  items?: Tab[];
}

defineOptions({ name: 'Tabs', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  type,
  class: className,
  rootClassName,
  size: customSize,
  onEdit,
  hideAdd,
  centered,
  addIcon,
  removeIcon,
  moreIcon,
  more,
  items,
  animated = true,
  style,
  indicator,
  classNames,
  styles,
  destroyOnHidden,
  tabPlacement,
  tabPosition,
  ...restProps
} = defineProps<TabsProps>();

const activeKey = defineModel<string | undefined>('activeKey');

const { prefixCls: customizePrefixCls } = toRefs(toReactive(restProps));

const {
  getPrefixCls,
  direction,
  getPopupContainer,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('tabs'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    popup: {
      _default: 'root',
    },
  })),
);
const { tabs } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('tabs', customizePrefixCls?.value));
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const tabsRef = useTemplateRef('tabsRef');

defineExpose({
  get nativeElement() {
    return tabsRef.value;
  },
});

const editable = computed<EditableConfig | undefined>(() => {
  let result;
  if (type === 'editable-card') {
    result = {
      onEdit: (editType, { key, event }) => {
        onEdit?.(editType === 'add' ? event : key!, editType);
      },
      removeIcon: removeIcon ?? tabs?.value?.removeIcon ?? <CloseOutlined />,
      addIcon: (addIcon ?? tabs?.value?.addIcon) || <PlusOutlined />,
      showAdd: hideAdd !== true,
    };
  }
  return result;
});

const rootPrefixCls = computed(() => getPrefixCls.value());

const size = useSize(computed(() => customSize));

const mergedAnimated = computed(() => useAnimateConfig(prefixCls.value, animated));

const mergedIndicator = computed<TabsProps['indicator']>(() => {
  return {
    align: indicator?.align ?? tabs?.value?.indicator?.align,
    size: indicator?.size ?? tabs?.value?.indicator?.size,
  };
});

const mergedPlacement = computed<TabPosition | undefined>(() => {
  const placement = tabPlacement ?? tabPosition ?? undefined;
  const isRTL = direction.value === 'rtl';
  switch (placement) {
    case 'start':
      return isRTL ? 'right' : 'left';
    case 'end':
      return isRTL ? 'left' : 'right';
    default:
      return placement;
  }
});
</script>
<template>
  <RcTabs
    ref="tabsRef"
    :direction="direction"
    :get-popup-container="getPopupContainer"
    v-bind="restProps"
    v-model:active-key="activeKey"
    :items="items"
    :class="clsx({
          [`${prefixCls}-${size}`]: size,
          [`${prefixCls}-card`]: ['card', 'editable-card'].includes(type!),
          [`${prefixCls}-editable-card`]: type === 'editable-card',
          [`${prefixCls}-centered`]: centered,
        },
        contextClassName,
        className,
        rootClassName,
        mergedClassNames.root,
        hashId,
        cssVarCls,
        rootCls)"
    :class-names="{
      ...mergedClassNames,
      popup: clsx(hashId, cssVarCls, rootCls, mergedClassNames.popup?.root),
    }"
    :styles="mergedStyles"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    :editable="editable"
    :more="{
      ...more,
      transitionName: `${rootPrefixCls}-slide-up`,
      icon: tabs?.more?.icon ?? tabs?.moreIcon ?? moreIcon ?? h(EllipsisOutlined),
    }"
    :prefix-cls="prefixCls"
    :animated="mergedAnimated"
    :indicator="mergedIndicator"
    :destroy-on-hidden="destroyOnHidden"
    :tab-position="mergedPlacement"
  />
</template>
