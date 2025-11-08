<script lang="tsx" setup>
import RcSteps from '@/vc-component/steps';
import type { StepsProps as RcStepsProps } from '@/vc-component/steps/Steps.vue';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';
import { TARGET_CLS } from '../_util/wave/interface';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import Tooltip from '../tooltip';
import PanelArrow from './PanelArrow.vue';
import ProgressIcon from './ProgressIcon.vue';
import useStyle from './style';
import type { VueNode } from '@/vc-util/type';
import { computed, getCurrentInstance, toRefs, type CSSProperties, type VNode } from 'vue';
import { useInternalContextInject } from './context';
import { isEmpty } from 'lodash-es';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';
import Render from '@/vc-component/render';
import { Wave } from '../_util/wave';
import clsx from 'clsx';

type RcIconRenderTypeInfo = Parameters<NonNullable<RcStepsProps['iconRender']>>[1];

export type IconRenderType = (props: {
  iconNode: VueNode;
  info: Pick<RcIconRenderTypeInfo, 'index' | 'active' | 'item' | 'components'>;
}) => VueNode;

export type StepsSemanticName =
  | 'root'
  | 'item'
  | 'itemWrapper'
  | 'itemIcon'
  | 'itemSection'
  | 'itemHeader'
  | 'itemTitle'
  | 'itemSubtitle'
  | 'itemContent'
  | 'itemRail';

export type StepsClassNamesType = SemanticClassNamesType<StepsProps, StepsSemanticName>;

export type StepsStylesType = SemanticStylesType<StepsProps, StepsSemanticName>;

interface StepItem {
  class?: string;
  style?: CSSProperties;
  classNames?: RcStepsProps['items'][number]['classNames'];
  styles?: RcStepsProps['items'][number]['styles'];

  content?: VueNode;
  icon?: VueNode;
  onClick?: (e: MouseEvent) => void;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
  title?: VueNode;
  subTitle?: VueNode;
}

export type ProgressDotRender = (
  iconDot: VueNode,
  info: {
    index: number;
    status: NonNullable<RcStepsProps['status']>;
    title: VueNode;
    content: VueNode;
  },
) => VueNode;

export interface StepsProps {
  // Style
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  rootClassName?: string;
  classNames?: StepsClassNamesType;
  styles?: StepsStylesType;
  variant?: 'filled' | 'outlined';
  size?: 'default' | 'small';

  // Layout
  type?: 'default' | 'navigation' | 'inline' | 'panel' | 'dot';
  orientation?: 'horizontal' | 'vertical';
  titlePlacement?: 'horizontal' | 'vertical';
  responsive?: boolean;
  ellipsis?: boolean;
  /**
   * Set offset cell, only work when `type` is `inline`.
   */
  offset?: number;

  // Data
  current?: number;
  initial?: number;
  items?: StepItem[];
  percent?: number;
  status?: 'wait' | 'process' | 'finish' | 'error';

  // Render
  iconRender?: IconRenderType;

  // Events
  onChange?: (current: number) => void;
}

defineOptions({ name: 'Steps', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  // Style
  size,
  class: className,
  rootClassName,
  style,
  variant = 'filled',
  type,
  classNames,
  styles,

  // Layout
  orientation,
  responsive = true,
  titlePlacement,
  ellipsis,
  offset = 0,

  // Data
  items,
  percent,
  current = 0,
  onChange,

  // Render
  iconRender: defaultIconRender,

  // MISC
  ...restProps
} = defineProps<StepsProps>();

const slots = defineSlots<{
  iconRender: (props: Parameters<IconRenderType>[0]) => VNode[];
}>();

const iconRender = computed(() => slots.iconRender || defaultIconRender);

const waveEffectClassNames: StepsProps['classNames'] = {
  itemIcon: TARGET_CLS,
};

const internalContent = useInternalContextInject();

const {
  getPrefixCls,
  direction: rtlDirection,
  class: contextClassName,
  style: contextStyle,
  classNames: ctxClassNames,
  styles: ctxStyles,
} = toRefs(useComponentConfig('steps'));

const contextClassNames = computed(() => (isEmpty(internalContent) ? ctxClassNames.value : {}));
const contextStyles = computed(() => (isEmpty(internalContent) ? ctxStyles.value : {}));
const components = computed(() => {
  let result: RcStepsProps['classNames'];
  if (!isEmpty(internalContent)) {
    result = {
      root: internalContent.rootComponent,
      item: internalContent.itemComponent,
    };
  }
  return result;
});

const prefixCls = computed(() => getPrefixCls.value('steps', restProps.prefixCls));
const itemIconCls = computed(() => `${prefixCls.value}-item-icon`);

const [hashId, cssVarCls] = useStyle(prefixCls);

// ============================= Size =============================
const mergedSize = useSize(computed(() => size));

// ============================= Item =============================
const mergedItems = computed(() => (items || []).filter(Boolean) as RcStepsProps['items']);

// ============================ Layout ============================
const point = useBreakpoint(computed(() => responsive));
const xs = computed(() => point.value?.xs);

// Type
const mergedType = computed(() => {
  if (type && type !== 'default') {
    return type;
  }
  return type;
});

const isInline = computed(() => mergedType.value === 'inline');
const isDot = computed(() => mergedType.value === 'dot' || mergedType.value === 'inline');

// Progress Dot Render function
const legacyProgressDotRender = computed(() => mergedType.value === 'dot');

const mergedOrientation = computed<StepsProps['orientation']>(() => {
  if (mergedType.value === 'panel') {
    return 'horizontal';
  }

  return (responsive && xs.value) || orientation === 'vertical' ? 'vertical' : 'horizontal';
});

const mergedTitlePlacement = computed<StepsProps['titlePlacement']>(() => {
  if (isDot.value || mergedOrientation.value === 'vertical') {
    return mergedOrientation.value === 'vertical' ? 'horizontal' : 'vertical';
  }
  if (type === 'navigation') {
    return 'horizontal';
  }

  return titlePlacement || 'horizontal';
});

// ========================== Percentage ==========================
const mergedPercent = computed(() => (isInline.value ? undefined : percent));

// ============================ Styles ============================

const vm = getCurrentInstance();
const [mergedClassNames, mergedStyles] = useMergeSemantic<StepsClassNamesType, StepsStylesType, StepsProps>(
  computed(() => [waveEffectClassNames, contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      variant,
      size: mergedSize.value,
      type: mergedType.value,
      orientation: mergedOrientation.value,
      titlePlacement: mergedTitlePlacement.value,
      current,
      percent: mergedPercent.value,
      responsive,
      offset,
    },
  })),
);

// ============================= Icon =============================
const internalIconRender: RcStepsProps['iconRender'] = (_, info) => {
  const {
    item,
    index,
    active,
    components: { Icon: StepIcon },
  } = info;

  const { status, icon } = item;

  let iconContent: VueNode = null;

  if (isDot.value || icon) {
    iconContent = icon;
  } else {
    switch (status) {
      case 'finish':
        iconContent = <CheckOutlined class={`${itemIconCls.value}-finish`} />;
        break;
      case 'error':
        iconContent = <CloseOutlined class={`${itemIconCls.value}-error`} />;
        break;
      default: {
        let numNode = <span class={`${itemIconCls.value}-number`}>{info.index + 1}</span>;

        if (status === 'process' && mergedPercent.value !== undefined) {
          numNode = (
            <ProgressIcon prefixCls={prefixCls.value} percent={mergedPercent.value}>
              {numNode}
            </ProgressIcon>
          );
        }

        iconContent = numNode;
      }
    }
  }

  let iconNode: VueNode = (
    <StepIcon>
      <Render content={iconContent}></Render>
    </StepIcon>
  );

  // Custom Render Props
  if (iconRender.value) {
    iconNode = iconRender.value({
      iconNode,
      info: {
        index,
        active,
        item,
        components: { Icon: StepIcon },
      },
    });
  } else if (typeof legacyProgressDotRender.value === 'function') {
    iconNode = (legacyProgressDotRender.value as any)?.(iconNode, {
      index,
      ...(item as Required<typeof item>),
    });
  }

  return iconNode;
};

// ============================ Custom ============================
const itemRender: RcStepsProps['itemRender'] = (itemNode, itemInfo) => {
  let content = itemNode;

  if (isInline.value && itemInfo.item.content) {
    content = (
      <Tooltip destroyOnHidden title={itemInfo.item.content}>
        {itemNode}
      </Tooltip>
    );
  }

  return (
    <Wave component="Steps" disabled={itemInfo.item.disabled || !onChange} colorSource={variant === 'filled' ? 'color' : null}>
      {content}
    </Wave>
  );
};

const itemWrapperRender = computed<RcStepsProps['itemWrapperRender']>(() =>
  mergedType.value === 'panel'
    ? (itemNode) => {
        return (
          <>
            <Render content={itemNode}></Render>
            <PanelArrow prefixCls={prefixCls.value} />
          </>
        );
      }
    : undefined,
);

// ============================ Styles ============================
const mergedStyle = computed<CSSProperties>(() => ({
  '--steps-items-offset': `${offset}`,
  ...contextStyle?.value,
  ...style,
}));

const stepsClassName = computed(() =>
  clsx(
    contextClassName?.value,
    `${prefixCls.value}-${variant}`,
    {
      [`${prefixCls.value}-${mergedType.value}`]: mergedType.value !== 'dot' ? mergedType.value : false,
      [`${prefixCls.value}-rtl`]: rtlDirection.value === 'rtl',
      [`${prefixCls.value}-dot`]: isDot.value,
      [`${prefixCls.value}-ellipsis`]: ellipsis,
      [`${prefixCls.value}-with-progress`]: mergedPercent.value !== undefined,
      [`${prefixCls.value}-${mergedSize.value}`]: mergedSize.value,
    },
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
  ),
);
</script>
<template>
  <RcSteps
    v-bind="restProps"
    :prefix-cls="prefixCls"
    :class="stepsClassName"
    :style="mergedStyle"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :orientation="mergedOrientation"
    :title-placement="mergedTitlePlacement"
    :components="components"
    :current="current"
    :items="mergedItems"
    @change="onChange"
    :icon-render="internalIconRender"
    :item-render="itemRender"
    :item-wrapper-render="itemWrapperRender"
  />
</template>
