<script lang="tsx" setup>
import type { CSSMotionProps } from '@/vc-component/motion';
import type { BasicDataNode, TreeProps as RcTreeProps } from '@/vc-component/tree';
import RcTree from '@/vc-component/tree';
import type { DataNode } from '@/vc-component/tree/interface';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import initCollapseMotion from '../_util/motion';
import { useComponentConfig, useConfigContextInject } from '../config-provider/context';
import { useToken } from '../theme/internal';
import useStyle from './style';
import dropIndicatorRender from './utils/dropIndicator';
import SwitcherIconCom from './utils/iconUtil';
import type { VueKey, VueNode } from '@/vc-util/type';
import { computed, getCurrentInstance, h, toRefs, useTemplateRef, type CSSProperties } from 'vue';
import { useDisabledContextInject } from '../config-provider/DisabledContext';
import { HolderOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';

export type SwitcherIcon = any | ((props: AntTreeNodeProps) => any);
export type TreeLeafIcon = any | ((props: AntTreeNodeProps) => any);
type TreeIcon = VueNode | ((props: AntdTreeNodeAttribute) => VueNode);

export interface AntdTreeNodeAttribute {
  eventKey: string;
  prefixCls: string;
  className: string;
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  halfChecked: boolean;
  children: VueNode;
  title: VueNode;
  pos: string;
  dragOver: boolean;
  dragOverGapTop: boolean;
  dragOverGapBottom: boolean;
  isLeaf: boolean;
  selectable: boolean;
  disabled: boolean;
  disableCheckbox: boolean;
}

export interface AntTreeNodeProps {
  className?: string;
  checkable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  title?: VueNode | ((data: DataNode) => VueNode);
  key?: VueKey;
  eventKey?: VueKey;
  isLeaf?: boolean;
  checked?: boolean;
  expanded?: boolean;
  loading?: boolean;
  selected?: boolean;
  selectable?: boolean;
  icon?: TreeIcon;
  children?: VueNode;
  [customProp: string]: any;
}

export interface AntTreeNode extends AntTreeNodeProps {}

export interface AntTreeNodeBaseEvent {
  node: AntTreeNode;
  nativeEvent: MouseEvent;
}

export interface AntTreeNodeCheckedEvent extends AntTreeNodeBaseEvent {
  event: 'check';
  checked?: boolean;
  checkedNodes?: AntTreeNode[];
}

export interface AntTreeNodeSelectedEvent extends AntTreeNodeBaseEvent {
  event: 'select';
  selected?: boolean;
  selectedNodes?: DataNode[];
}

export interface AntTreeNodeExpandedEvent extends AntTreeNodeBaseEvent {
  expanded?: boolean;
}

export interface AntTreeNodeMouseEvent {
  node: AntTreeNode;
  event: (e: DragEvent) => void;
}

export interface AntTreeNodeDragEnterEvent extends AntTreeNodeMouseEvent {
  expandedKeys: VueKey[];
}

export interface AntTreeNodeDropEvent {
  node: AntTreeNode;
  dragNode: AntTreeNode;
  dragNodesKeys: VueKey[];
  dropPosition: number;
  dropToGap?: boolean;
  event: (e: MouseEvent) => void;
}

// [Legacy] Compatible for v3
export type TreeNodeNormal = DataNode;

type DraggableFn = (node: DataNode) => boolean;

interface DraggableConfig {
  icon?: VueNode | boolean;
  nodeDraggable?: DraggableFn;
}

type SemanticName = 'root' | 'item' | 'itemIcon' | 'itemTitle';

export interface TreeProps<T extends BasicDataNode = DataNode>
  extends Omit<
    RcTreeProps<T>,
    'prefixCls' | 'showLine' | 'direction' | 'draggable' | 'icon' | 'switcherIcon' | 'classNames' | 'styles'
  > {
  showLine?: boolean | { showLeafIcon: boolean | TreeLeafIcon };
  class?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  /** Whether to support multiple selection */
  multiple?: boolean;
  /** Whether to automatically expand the parent node */
  autoExpandParent?: boolean;
  /** Node selection in Checkable state is fully controlled (the selected state of parent and child nodes is no longer associated) */
  checkStrictly?: boolean;
  /** Whether to support selection */
  checkable?: boolean;
  /** whether to disable the tree */
  disabled?: boolean;
  /** Expand all tree nodes by default */
  defaultExpandAll?: boolean;
  /** Expand the corresponding tree node by default */
  defaultExpandParent?: boolean;
  selectable?: boolean;
  /** Click on the tree node to trigger */
  filterAntTreeNode?: (node: AntTreeNode) => boolean;
  loadedKeys?: VueKey[];
  /** Set the node to be draggable (IE>8) */
  draggable?: DraggableFn | boolean | DraggableConfig;
  style?: CSSProperties;
  showIcon?: boolean;
  icon?: TreeIcon;
  switcherIcon?: SwitcherIcon;
  switcherLoadingIcon?: VueNode;
  prefixCls?: string;
  blockNode?: boolean;
}

defineOptions({ name: 'Tree', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  showIcon = false,
  showLine,
  switcherIcon,
  switcherLoadingIcon,
  blockNode = false,
  checkable = false,
  selectable = true,
  draggable,
  disabled,
  motion: customMotion,
  style,
  rootClassName,
  classNames: treeClassNames,
  styles,

  defaultExpandParent = true,
  virtual: customVirtual = true,
} = defineProps<TreeProps>();

const expandedKeys = defineModel<VueKey[]>('expandedKeys');
const checkedKeys = defineModel<VueKey[] | { checked: VueKey[]; halfChecked: VueKey[] }>('checkedKeys');
const selectedKeys = defineModel<VueKey[]>('selectedKeys');

const domRef = useTemplateRef('domRef');

defineExpose({
  ...domRef.value,
});

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('tree'));
const { virtual } = toRefs(useConfigContextInject());

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, treeClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const prefixCls = computed(() => getPrefixCls.value('tree', customizePrefixCls));
const rootPrefixCls = computed(() => getPrefixCls.value());

const contextDisabled = useDisabledContextInject();
const mergedDisabled = computed(() => disabled ?? contextDisabled?.value);

const motion = computed<CSSMotionProps>(() => {
  return (
    customMotion ?? {
      ...initCollapseMotion(rootPrefixCls.value),
      motionAppear: false,
    }
  );
});

const vm = getCurrentInstance();

const newProps = computed(() => ({
  ...vm.props,
  checkable,
  selectable,
  showIcon,
  motion: motion.value,
  blockNode,
  disabled: mergedDisabled.value,
  showLine: Boolean(showLine),
  dropIndicatorRender,
}));

const [hashId, cssVarCls] = useStyle(prefixCls);
const [, token] = useToken();

const itemHeight = computed(
  () => token?.value?.paddingXS / 2 + (token?.value?.Tree?.titleHeight || token?.value?.controlHeightSM),
);

const draggableConfig = computed(() => {
  if (!draggable) {
    return false;
  }

  let mergedDraggable: DraggableConfig = {};
  switch (typeof draggable) {
    case 'function':
      mergedDraggable.nodeDraggable = draggable;
      break;
    case 'object':
      mergedDraggable = { ...draggable };
      break;
    default:
      break;
    // Do nothing
  }

  if (mergedDraggable.icon !== false) {
    mergedDraggable.icon = mergedDraggable.icon || <HolderOutlined />;
  }

  return mergedDraggable;
});

const renderSwitcherIcon = (nodeProps: AntTreeNodeProps) => (
  <SwitcherIconCom
    prefixCls={prefixCls.value}
    switcherIcon={switcherIcon}
    switcherLoadingIcon={switcherLoadingIcon}
    treeNodeProps={nodeProps}
    showLine={showLine}
  />
);
</script>
<template>
  <RcTree
    ref="domRef"
    v-bind="newProps"
    v-model:expanded-keys="expandedKeys"
    v-model:checked-keys="checkedKeys"
    v-model:selected-keys="selectedKeys"
    :item-height="itemHeight"
    :default-expand-parent="defaultExpandParent"
    :virtual="customVirtual ?? virtual"
    :prefix-cls="prefixCls"
    :class="
      clsx(
        {
          [`${prefixCls}-icon-hide`]: !showIcon,
          [`${prefixCls}-block-node`]: blockNode,
          [`${prefixCls}-unselectable`]: !selectable,
          [`${prefixCls}-rtl`]: direction === 'rtl',
          [`${prefixCls}-disabled`]: mergedDisabled,
        },
        contextClassName,
        className,
        hashId,
        cssVarCls,
      )
    "
    :style="{ ...contextStyle, ...style }"
    :root-class-name="clsx(mergedClassNames?.root, rootClassName)"
    :root-style="mergedStyles?.root"
    :class-names="mergedClassNames"
    :styles="mergedStyles"
    :direction="direction"
    :checkable="checkable ? h('span', { class: `${prefixCls}-checkbox-inner` }) : checkable"
    :selectable="selectable"
    :switcher-icon="renderSwitcherIcon"
    :draggable="draggableConfig"
  />
</template>
