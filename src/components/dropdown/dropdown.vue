<script lang="tsx" setup>
import { computed, getCurrentInstance, toRefs, type ComponentInstance, type CSSProperties, type VNode } from 'vue';
import RcDropdown from '@/vc-component/dropdown';
import type { MenuProps as RcMenuProps } from '@/vc-component/menu';
import type { AlignType } from '@/vc-component/trigger';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import { useZIndex } from '../_util/hooks/useZIndex';
import type { AdjustOverflow } from '../_util/placements';
import getPlacements from '../_util/placements';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Menu from '../menu';
import { useToken } from '../theme/internal';
import useStyle from './style';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { ZIndexContextProvider } from '../_util/zindexContext';
import { onlyChild } from '../_util/onlyChild';
import isPrimitive from '../_util/isPrimitive';
import OverrideProvider from '../menu/OverrideProvider.vue';
import { cloneElement } from '@/vc-util/Children/util';

type Placement = (typeof _Placements)[number];

type DropdownPlacement = Exclude<Placement, 'topCenter' | 'bottomCenter'>;

export type DropdownArrowOptions = {
  pointAtCenter?: boolean;
};

type SemanticName = 'root' | 'item' | 'itemTitle' | 'itemIcon' | 'itemContent';

type MenuProps = Partial<ComponentInstance<typeof Menu>['$props']>;

export interface DropdownProps {
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  menu?: MenuProps & { activeKey?: RcMenuProps['activeKey'] };
  autofocus?: boolean;
  arrow?: boolean | DropdownArrowOptions;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  popupRender?: (originNode: VueNode) => VueNode;
  onOpenChange?: (open: boolean, info: { source: 'trigger' | 'menu' }) => void;
  disabled?: boolean;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
  align?: AlignType;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  transitionName?: string;
  placement?: Placement;
  overlayStyle?: CSSProperties;
  forceRender?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  openClassName?: string;
  autoAdjustOverflow?: boolean | AdjustOverflow;
}

defineOptions({ name: 'Dropdown', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  menu,
  arrow,
  prefixCls: customizePrefixCls,
  trigger,
  disabled,
  popupRender,
  getPopupContainer,
  onOpenChange,
  mouseEnterDelay = 0.15,
  mouseLeaveDelay = 0.1,
  autoAdjustOverflow = true,
  placement = '',
  transitionName,
  classNames: dropdownClassNames,
  styles,
  destroyOnHidden,
} = defineProps<DropdownProps>();

const slots = defineSlots<{
  default?: () => VNode[];
}>();

const _Placements = ['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight', 'top', 'bottom'] as const;

const {
  getPrefixCls,
  direction,
  getPopupContainer: getContextPopupContainer,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('dropdown'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, dropdownClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const mergedRootStyles = computed(() => ({
  ...contextStyle?.value,
  ...mergedStyles?.value?.root,
}));

// =================== Warning =====================
const warning = devUseWarning('Dropdown');
if (process.env.NODE_ENV !== 'production') {
  if (placement.includes('Center')) {
    warning.deprecated(
      !placement.includes('Center'),
      `placement: ${placement}`,
      `placement: ${placement.slice(0, placement.indexOf('Center'))}`,
    );
  }
}

const memoTransitionName = computed(() => {
  const rootPrefixCls = getPrefixCls.value();

  if (transitionName !== undefined) {
    return transitionName;
  }
  if (placement.includes('top')) {
    return `${rootPrefixCls}-slide-down`;
  }
  return `${rootPrefixCls}-slide-up`;
});

const memoPlacement = computed<DropdownPlacement>(() => {
  if (!placement) {
    return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
  }

  if (placement.includes('Center')) {
    return placement.slice(0, placement.indexOf('Center')) as DropdownPlacement;
  }

  return placement as DropdownPlacement;
});

const prefixCls = computed(() => getPrefixCls.value('dropdown', customizePrefixCls));
const rootCls = useCSSVarCls(prefixCls);
const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

const [, token] = useToken();

const PopupTrigger = (props) => {
  const child = onlyChild(isPrimitive(slots.default?.()) ? <span>{slots.default?.()}</span> : slots.default?.()) as VNode;
  return cloneElement(child, {
    ...omit(props, ['class']),
    class: clsx(
      `${prefixCls.value}-trigger`,
      {
        [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
      },
      child.props?.class,
      props?.class,
    ),
    ...((child.props?.disabled ?? disabled) && {
      disabled: true,
    }),
  });
};
const triggerActions = computed(() => (disabled ? [] : trigger));
const alignPoint = computed(() => !!triggerActions.value?.includes('contextMenu'));

// =========================== Open ============================
const mergedOpen = defineModel('open', { default: false });

const onInnerOpenChange = (nextOpen: boolean) => {
  onOpenChange?.(nextOpen, { source: 'trigger' });
  mergedOpen.value = nextOpen;
};

// =========================== Overlay ============================
const overlayClassNameCustomized = computed(() =>
  clsx(hashId.value, cssVarCls.value, rootCls.value, contextClassName?.value, mergedClassNames.value?.root, {
    [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
  }),
);

const builtinPlacements = computed(() =>
  getPlacements({
    arrowPointAtCenter: typeof arrow === 'object' && arrow.pointAtCenter,
    autoAdjustOverflow,
    offset: token.value.marginXXS,
    arrowWidth: arrow ? token.value.sizePopupArrow : 0,
    borderRadius: token.value.borderRadius,
  }),
);

const onMenuClick = () => {
  if (menu?.selectable && menu?.multiple) {
    return;
  }
  onOpenChange?.(false, { source: 'menu' });
  mergedOpen.value = false;
};

const renderOverlay = () => {
  // @rc-component/dropdown already can process the function of overlay, but we have check logic here.
  // So we need render the element to check and pass back to @rc-component/dropdown.
  const menuClassNames = omit(mergedClassNames.value, ['root']);
  const menuStyles = omit(mergedStyles.value, ['root']);
  let overlayNode: VueNode;
  if (menu?.items) {
    overlayNode = (
      <Menu
        {...menu}
        classNames={{
          ...menuClassNames,
          subMenu: {
            ...menuClassNames,
          },
        }}
        styles={{
          ...menuStyles,
          subMenu: {
            ...menuStyles,
          },
        }}
      />
    );
  }
  if (popupRender) {
    overlayNode = popupRender(overlayNode);
  }
  overlayNode = typeof overlayNode === 'string' ? <span>{overlayNode}</span> : overlayNode;
  return (
    <OverrideProvider
      prefixCls={`${prefixCls.value}-menu`}
      rootClassName={clsx(cssVarCls.value, rootCls.value)}
      expandIcon={
        <span class={`${prefixCls.value}-menu-submenu-arrow`}>
          {direction.value === 'rtl' ? (
            <LeftOutlined class={`${prefixCls.value}-menu-submenu-arrow-icon`} />
          ) : (
            <RightOutlined class={`${prefixCls.value}-menu-submenu-arrow-icon`} />
          )}
        </span>
      }
      mode="vertical"
      selectable={false}
      onClick={onMenuClick}
      validator={({ mode }) => {
        // Warning if use other mode
        warning(!mode || mode === 'vertical', 'usage', `mode="${mode}" is not supported for Dropdown's Menu.`);
      }}
    >
      {overlayNode}
    </OverrideProvider>
  );
};

// =========================== zIndex ============================
const [zIndex, contextZIndex] = useZIndex(
  'Dropdown',
  computed(() => mergedRootStyles.value.zIndex as number),
);

const vm = getCurrentInstance();
// ============================ Render ============================
const RenderNode = () => {
  let renderNode = (
    <RcDropdown
      {...omit(vm.props, ['rootClassName', 'onOpenChange', 'onVisibleChange'])}
      alignPoint={alignPoint.value}
      mouseEnterDelay={mouseEnterDelay}
      mouseLeaveDelay={mouseLeaveDelay}
      visible={mergedOpen.value}
      builtinPlacements={builtinPlacements.value}
      arrow={!!arrow}
      overlayClassName={overlayClassNameCustomized.value}
      prefixCls={prefixCls.value}
      getPopupContainer={getPopupContainer || getContextPopupContainer?.value}
      transitionName={memoTransitionName.value}
      trigger={triggerActions.value}
      overlay={renderOverlay}
      placement={memoPlacement.value}
      onVisibleChange={onInnerOpenChange}
      overlayStyle={{ ...mergedRootStyles.value, zIndex: zIndex.value }}
      autoDestroy={destroyOnHidden}
    >
      {{
        default: (props) => {
          return <PopupTrigger {...props}> </PopupTrigger>;
        },
      }}
    </RcDropdown>
  );

  if (zIndex) {
    renderNode = <ZIndexContextProvider value={contextZIndex.value}>{renderNode}</ZIndexContextProvider>;
  }
  return renderNode;
};
</script>
<template>
  <RenderNode />
</template>
