<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs, type CSSProperties } from 'vue';
import type { CollapseProps as RcCollapseProps } from '@/vc-component/collapse';
import RcCollapse from '@/vc-component/collapse';
import type { CSSMotionProps } from '@/vc-component/motion';
import initCollapseMotion from '../_util/motion';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import type { CollapsibleType } from './CollapsePanel';
import useStyle from './style';
import type { VueKey, VueNode } from '@/vc-util/type';
import { RightOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { cloneElement } from '@/vc-util/Children/util';
import { useMergeSemantic, type SemanticClassNamesType, type SemanticStylesType } from '../_util/hooks';

export type ExpandIconPlacement = 'start' | 'end';

export type CollapseSemanticName = 'root' | 'header' | 'title' | 'body' | 'icon';

export type CollapseClassNamesType = SemanticClassNamesType<CollapseProps, CollapseSemanticName>;
export type CollapseStylesType = SemanticStylesType<CollapseProps, CollapseSemanticName>;

export interface CollapseProps extends Pick<RcCollapseProps, 'items'> {
  /** 手风琴效果 */
  accordion?: boolean;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
  onChange?: (key: VueKey[]) => void;
  style?: CSSProperties;
  className?: string;
  rootClassName?: string;
  bordered?: boolean;
  prefixCls?: string;
  expandIcon?: (panelProps: PanelProps) => VueNode;
  expandIconPlacement?: ExpandIconPlacement;
  ghost?: boolean;
  size?: SizeType;
  collapsible?: CollapsibleType;
  classNames?: CollapseClassNamesType;
  styles?: CollapseStylesType;
}

interface PanelProps {
  isActive?: boolean;
  header?: VueNode;
  className?: string;
  style?: CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  extra?: VueNode;
  collapsible?: CollapsibleType;
  classNames?: CollapseClassNamesType;
  styles?: CollapseStylesType;
}

defineOptions({ name: 'Collapse', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  className,
  rootClassName,
  style,
  bordered = true,
  ghost,
  size: customizeSize,
  expandIconPlacement,
  destroyOnHidden,
  expandIcon,
  classNames,
  styles,
} = defineProps<CollapseProps>();

const activeKey = defineModel<VueKey[]>('activeKey');

const {
  getPrefixCls,
  direction,
  expandIcon: contextExpandIcon,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('collapse'));

const mergedSize = useSize(computed(() => (ctx) => customizeSize ?? ctx ?? 'middle'));
const prefixCls = computed(() => getPrefixCls.value('collapse', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());
const [hashId, cssVarCls] = useStyle(prefixCls);

const mergedExpandIcon = computed(() => expandIcon ?? contextExpandIcon?.value);
const mergedPlacement = computed(() => expandIconPlacement ?? 'start');

const vm = getCurrentInstance();

const [mergedClassNames, mergedStyles] = useMergeSemantic<CollapseClassNamesType, CollapseStylesType, CollapseProps>(
  computed(() => [contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
  computed(() => ({
    props: {
      ...vm.props,
      size: mergedSize.value,
      bordered,
      expandIconPlacement: mergedPlacement.value,
    },
  })),
);

const renderExpandIcon = (panelProps: PanelProps = {}) => {
  const icon =
    typeof mergedExpandIcon.value === 'function' ? (
      mergedExpandIcon.value(panelProps)
    ) : (
      <RightOutlined
        rotate={panelProps.isActive ? (direction?.value === 'rtl' ? -90 : 90) : undefined}
        aria-label={panelProps.isActive ? 'expanded' : 'collapsed'}
      />
    );
  return cloneElement(icon, () => ({
    class: clsx((icon as any)?.props?.class, `${prefixCls.value}-arrow`),
  }));
};

const collapseClassName = computed(() =>
  clsx(
    `${prefixCls.value}-icon-placement-${mergedPlacement.value}`,
    {
      [`${prefixCls.value}-borderless`]: !bordered,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      [`${prefixCls.value}-ghost`]: !!ghost,
      [`${prefixCls.value}-${mergedSize.value}`]: mergedSize.value !== 'middle',
    },
    contextClassName?.value,
    className,
    rootClassName,
    hashId.value,
    cssVarCls.value,
    mergedClassNames?.value?.root,
  ),
);

const openMotion = computed<CSSMotionProps>(() => ({
  ...initCollapseMotion(rootPrefixCls.value),
  motionAppear: false,
  leavedClassName: `${prefixCls.value}-content-hidden`,
}));
</script>
<template>
  <RcCollapse
    :open-motion="openMotion"
    v-bind="omit($props, ['rootClassName'])"
    v-model:active-key="activeKey"
    :expand-icon="renderExpandIcon"
    :prefix-cls="prefixCls"
    :class="collapseClassName"
    :style="{ ...mergedStyles.root, ...contextStyle, ...style }"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :destroy-on-hidden="destroyOnHidden"
  />
</template>
