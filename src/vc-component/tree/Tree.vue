<script lang="tsx" setup generic="TreeDataType extends BasicDataNode = DataNode">
import KeyCode from '@/vc-util/KeyCode';
import pickAttrs from '@/vc-util/pickAttrs';
import type { VueKey } from '@/vc-util/type';
import warning from '@/vc-util/warning';
import clsx from 'clsx';
import { assign } from 'lodash-es';
import {
  computed,
  markRaw,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useAttrs,
  useTemplateRef,
  watch,
  type CSSProperties,
} from 'vue';
import {
  TreeContextProvider,
  type NodeDragEventParams,
  type NodeMouseEventHandler,
  type NodeMouseEventParams,
} from './contextTypes';
import DropIndicator from './DropIndicator.vue';
import {
  MOTION_KEY,
  MotionEntity,
  type BasicDataNode,
  type DataNode,
  type Direction,
  type EventDataNode,
  type FieldNames,
  type FlattenNode,
  type IconType,
  type KeyEntities,
  type TreeNodeProps,
} from './interface';
import NodeList from './NodeList.vue';
import {
  arrAdd,
  arrDel,
  calcDropPosition,
  calcSelectedKeys,
  conductExpandParent,
  getDragChildrenKeys,
  parseCheckedKeys,
  posToArr,
} from './util';
import { conductCheck } from './utils/conductUtil';
import getEntity from './utils/keyUtil';
import {
  convertDataToEntities,
  convertNodePropsToEventData,
  fillFieldNames,
  flattenTreeData,
  getTreeNodeProps,
  warningWithoutKey,
} from './utils/treeUtil';
export interface CheckInfo<TreeDataType extends BasicDataNode = DataNode> {
  event: 'check';
  node: EventDataNode<TreeDataType>;
  checked: boolean;
  nativeEvent: MouseEvent;
  checkedNodes: TreeDataType[];
  checkedNodesPositions?: { node: TreeDataType; pos: string }[];
  halfCheckedKeys?: VueKey[];
}

export interface AllowDropOptions<TreeDataType extends BasicDataNode = DataNode> {
  dragNode: TreeDataType;
  dropNode: TreeDataType;
  dropPosition: -1 | 0 | 1;
}
export type AllowDrop<TreeDataType extends BasicDataNode = DataNode> = (options: AllowDropOptions<TreeDataType>) => boolean;

export type DraggableFn = (node: DataNode) => boolean;
export type DraggableConfig = {
  icon?: any;
  nodeDraggable?: DraggableFn;
};

export type ExpandAction = false | 'click' | 'doubleClick';

export type SemanticName = 'itemIcon' | 'item' | 'itemTitle';
export interface TreeProps<TreeDataType extends BasicDataNode = DataNode> {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
  focusable?: boolean;
  activeKey?: VueKey | null;
  tabindex?: number;
  treeData?: TreeDataType[]; // Generate treeNode by children
  fieldNames?: FieldNames;
  showLine?: boolean;
  showIcon?: boolean;
  icon?: IconType;
  selectable?: boolean;
  expandAction?: ExpandAction;
  disabled?: boolean;
  multiple?: boolean;
  checkable?: boolean | any;
  checkStrictly?: boolean;
  draggable?: DraggableFn | boolean | DraggableConfig;
  defaultExpandParent?: boolean;
  autoExpandParent?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: VueKey[];
  expandedKeys?: VueKey[];
  defaultCheckedKeys?: VueKey[];
  checkedKeys?: VueKey[] | { checked: VueKey[]; halfChecked: VueKey[] };
  defaultSelectedKeys?: VueKey[];
  selectedKeys?: VueKey[];
  allowDrop?: AllowDrop<TreeDataType>;
  titleRender?: any;
  dropIndicatorRender?: any;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onContextmenu?: (e: MouseEvent) => void;
  onClick?: NodeMouseEventHandler<TreeDataType>;
  onDoubleClick?: NodeMouseEventHandler<TreeDataType>;
  onScroll?: (e: UIEvent) => void;
  onExpand?: (
    expandedKeys: VueKey[],
    info: {
      node: EventDataNode<TreeDataType>;
      expanded: boolean;
      nativeEvent: MouseEvent;
    },
  ) => void;
  onCheck?: (checked: { checked: VueKey[]; halfChecked: VueKey[] } | VueKey[], info: CheckInfo<TreeDataType>) => void;
  onSelect?: (
    selectedKeys: VueKey[],
    info: {
      event: 'select';
      selected: boolean;
      node: EventDataNode<TreeDataType>;
      selectedNodes: TreeDataType[];
      nativeEvent: MouseEvent;
    },
  ) => void;
  onLoad?: (
    loadedKeys: VueKey[],
    info: {
      event: 'load';
      node: EventDataNode<TreeDataType>;
    },
  ) => void;
  loadData?: (treeNode: EventDataNode<TreeDataType>) => Promise<any>;
  loadedKeys?: VueKey[];
  onMouseEnter?: (info: NodeMouseEventParams<TreeDataType>) => void;
  onMouseLeave?: (info: NodeMouseEventParams<TreeDataType>) => void;
  onRightClick?: (info: { event: MouseEvent; node: EventDataNode<TreeDataType> }) => void;
  onDragStart?: (info: NodeDragEventParams<TreeDataType>) => void;
  onDragEnter?: (info: NodeDragEventParams<TreeDataType> & { expandedKeys: VueKey[] }) => void;
  onDragOver?: (info: NodeDragEventParams<TreeDataType>) => void;
  onDragLeave?: (info: NodeDragEventParams<TreeDataType>) => void;
  onDragEnd?: (info: NodeDragEventParams<TreeDataType>) => void;
  onDrop?: (
    info: NodeDragEventParams<TreeDataType> & {
      dragNode: EventDataNode<TreeDataType>;
      dragNodesKeys: VueKey[];
      dropPosition: number;
      dropToGap: boolean;
    },
  ) => void;
  /**
   * Used for `rc-tree-select` only.
   * Do not use in your production code directly since this will be refactor.
   */
  onActiveChange?: (key: VueKey) => void;
  filterTreeNode?: (treeNode: EventDataNode<TreeDataType>) => boolean;
  motion?: any;
  switcherIcon?: IconType;

  // Virtual List
  height?: number | undefined;
  itemHeight?: number;
  scrollWidth?: number;
  itemScrollOffset?: number;
  virtual?: boolean;

  // direction for drag logic
  direction?: Direction;

  rootClassName?: string;
  rootStyle?: CSSProperties;
}

interface TreeState<TreeDataType extends BasicDataNode = DataNode> {
  keyEntities: KeyEntities<TreeDataType>;

  indent: number | null;

  selectedKeys: VueKey[];
  checkedKeys: VueKey[];
  halfCheckedKeys: VueKey[];
  loadedKeys: VueKey[];
  loadingKeys: VueKey[];
  expandedKeys: VueKey[];

  draggingNodeKey: VueKey;
  dragChildrenKeys: VueKey[];

  // for details see comment in Tree.state
  dropPosition: -1 | 0 | 1 | null;
  dropLevelOffset: number | null;
  dropContainerKey: VueKey | null;
  dropTargetKey: VueKey | null;
  dropTargetPos: string | null;
  dropAllowed: boolean;
  dragOverNodeKey: VueKey | null;

  treeData: TreeDataType[];
  flattenNodes: FlattenNode<TreeDataType>[];

  focused: boolean;
  activeKey: VueKey | null;

  // Record if list is changing
  listChanging: boolean;

  prevProps: TreeProps;

  fieldNames: FieldNames;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const props = withDefaults(defineProps<TreeProps<TreeDataType>>(), {
  prefixCls: 'rc-tree',
  showLine: false,
  showIcon: true,
  selectable: true,
  multiple: false,
  checkable: false,
  disabled: false,
  checkStrictly: false,
  draggable: false,
  defaultExpandParent: true,
  autoExpandParent: false,
  defaultExpandAll: false,
  defaultExpandedKeys: () => [],
  defaultCheckedKeys: () => [],
  defaultSelectedKeys: () => [],
  dropIndicatorRender: DropIndicator,
  allowDrop: () => true,
  expandAction: false,
  tabindex: 0,
  virtual: true,
});

const MAX_RETRY_TIMES = 10;

const destroyed = ref(false);

const delayedDragEnterLogic = ref<Record<VueKey, number>>();

const loadingRetryTimes = ref<Record<VueKey, number>>({});

const state = reactive<TreeState<TreeDataType>>({
  keyEntities: {},

  indent: null,

  selectedKeys: [],
  checkedKeys: [],
  halfCheckedKeys: [],
  loadedKeys: [],
  loadingKeys: [],
  expandedKeys: [],

  draggingNodeKey: null,
  dragChildrenKeys: [],

  // dropTargetKey is the key of abstract-drop-node
  // the abstract-drop-node is the real drop node when drag and drop
  // not the DOM drag over node
  dropTargetKey: null,
  dropPosition: null, // the drop position of abstract-drop-node, inside 0, top -1, bottom 1
  dropContainerKey: null, // the container key of abstract-drop-node if dropPosition is -1 or 1
  dropLevelOffset: null, // the drop level offset of abstract-drag-over-node
  dropTargetPos: null, // the pos of abstract-drop-node
  dropAllowed: true, // if drop to abstract-drop-node is allowed
  // the abstract-drag-over-node
  // if mouse is on the bottom of top dom node or no the top of the bottom dom node
  // abstract-drag-over-node is the top node
  dragOverNodeKey: null,

  treeData: [],
  flattenNodes: [],

  focused: false,
  activeKey: null,

  listChanging: false,

  prevProps: null,

  fieldNames: fillFieldNames(),
});

const dragStartMousePosition = ref(null);

const dragNodeProps = ref<TreeNodeProps<TreeDataType>>(null);

const currentMouseOverDroppableNodeKey = ref(null);

const listRef = useTemplateRef('listRef');

onMounted(() => {
  destroyed.value = false;
  onUpdated();
});

function onUpdated() {
  const { activeKey, itemScrollOffset = 0 } = props;
  if (activeKey !== undefined && activeKey !== state.activeKey) {
    state.activeKey = activeKey;

    if (activeKey !== null) {
      scrollTo({ key: activeKey, offset: itemScrollOffset });
    }
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('dragend', onWindowDragEnd);
  destroyed.value = true;
});

function getDerivedStateFromProps(props: TreeProps<DataNode>, prevState: TreeState) {
  const { prevProps } = prevState;
  const newState: Partial<TreeState> = {
    prevProps: props,
  };

  function needSync(name: string) {
    return (!prevProps && Reflect.has(props, name)) || (prevProps && prevProps[name] !== props[name]);
  }

  // ================== Tree Node ==================
  let treeData: DataNode[];

  // fieldNames
  let { fieldNames } = prevState;
  if (needSync('fieldNames')) {
    fieldNames = fillFieldNames(props.fieldNames);
    newState.fieldNames = fieldNames;
  }

  // Check if `treeData` or `children` changed and save into the state.
  if (needSync('treeData')) {
    ({ treeData } = props);
  }

  // Save flatten nodes info and convert `treeData` into keyEntities
  if (treeData) {
    newState.treeData = treeData;
    const entitiesMap = convertDataToEntities(treeData, { fieldNames });
    newState.keyEntities = {
      [MOTION_KEY]: MotionEntity,
      ...entitiesMap.keyEntities,
    };

    // Warning if treeNode not provide key
    if (process.env.NODE_ENV !== 'production') {
      warningWithoutKey(treeData, fieldNames);
    }
  }

  const keyEntities = newState.keyEntities || prevState.keyEntities;

  // ================ expandedKeys =================
  if (needSync('expandedKeys') || (prevProps && needSync('autoExpandParent'))) {
    newState.expandedKeys =
      props.autoExpandParent || (!prevProps && props.defaultExpandParent)
        ? conductExpandParent(props.expandedKeys, keyEntities)
        : props.expandedKeys;
  } else if (!prevProps && props.defaultExpandAll) {
    const cloneKeyEntities = { ...keyEntities };
    delete cloneKeyEntities[MOTION_KEY];

    // Only take the key who has the children to enhance the performance
    const nextExpandedKeys: VueKey[] = [];
    Object.keys(cloneKeyEntities).forEach((key) => {
      const entity = cloneKeyEntities[key];
      if (entity.children && entity.children.length) {
        nextExpandedKeys.push(entity.key);
      }
    });

    newState.expandedKeys = nextExpandedKeys;
  } else if (!prevProps && props.defaultExpandedKeys) {
    newState.expandedKeys =
      props.autoExpandParent || props.defaultExpandParent
        ? conductExpandParent(props.defaultExpandedKeys, keyEntities)
        : props.defaultExpandedKeys;
  }

  if (!newState.expandedKeys) {
    delete newState.expandedKeys;
  }

  // ================ flattenNodes =================
  if (treeData || newState.expandedKeys) {
    const flattenNodes = flattenTreeData<DataNode>(
      treeData || prevState.treeData,
      newState.expandedKeys || prevState.expandedKeys,
      fieldNames,
    );
    newState.flattenNodes = flattenNodes;
  }

  // ================ selectedKeys =================
  if (props.selectable) {
    if (needSync('selectedKeys')) {
      newState.selectedKeys = calcSelectedKeys(props.selectedKeys, props);
    } else if (!prevProps && props.defaultSelectedKeys) {
      newState.selectedKeys = calcSelectedKeys(props.defaultSelectedKeys, props);
    }
  }

  // ================= checkedKeys =================
  if (props.checkable) {
    let checkedKeyEntity: { checkedKeys?: VueKey[]; halfCheckedKeys?: VueKey[] };

    if (needSync('checkedKeys')) {
      checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {};
    } else if (!prevProps && props.defaultCheckedKeys) {
      checkedKeyEntity = parseCheckedKeys(props.defaultCheckedKeys) || {};
    } else if (treeData) {
      // If `treeData` changed, we also need check it
      checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {
        checkedKeys: prevState.checkedKeys,
        halfCheckedKeys: prevState.halfCheckedKeys,
      };
    }

    if (checkedKeyEntity) {
      let { checkedKeys = [], halfCheckedKeys = [] } = checkedKeyEntity;

      if (!props.checkStrictly) {
        const conductKeys = conductCheck(checkedKeys, true, keyEntities);
        ({ checkedKeys, halfCheckedKeys } = conductKeys);
      }

      newState.checkedKeys = checkedKeys;
      newState.halfCheckedKeys = halfCheckedKeys;
    }
  }

  // ================= loadedKeys ==================
  if (needSync('loadedKeys')) {
    newState.loadedKeys = props.loadedKeys;
  }
  assign(state, newState);
}

watch(
  [() => props, () => state],
  () => {
    getDerivedStateFromProps(JSON.parse(JSON.stringify(props)) as any, markRaw(state) as unknown as TreeState);
  },
  { immediate: true, deep: true },
);

function onNodeDragStart(event, nodeProps) {
  const { expandedKeys, keyEntities } = state;
  const { onDragStart } = props;
  const { eventKey } = nodeProps;

  dragNodeProps.value = nodeProps;
  dragStartMousePosition.value = {
    x: event.clientX,
    y: event.clientY,
  };

  const newExpandedKeys = arrDel(expandedKeys, eventKey);

  state.draggingNodeKey = eventKey;
  state.dragChildrenKeys = getDragChildrenKeys(eventKey, keyEntities);
  state.indent = listRef.value.getIndentWidth();

  setExpandedKeys(newExpandedKeys);

  window.addEventListener('dragend', onWindowDragEnd);

  onDragStart?.({ event, node: convertNodePropsToEventData<TreeDataType>(nodeProps) });
}

/**
 * [Legacy] Select handler is smaller than node,
 * so that this will trigger when drag enter node or select handler.
 * This is a little tricky if customize css without padding.
 * Better for use mouse move event to refresh drag state.
 * But let's just keep it to avoid event trigger logic change.
 */
function onNodeDragEnter(event: DragEvent, nodeProps: TreeNodeProps<TreeDataType>) {
  const { expandedKeys, keyEntities, dragChildrenKeys, flattenNodes, indent } = state;
  const { onDragEnter, onExpand, allowDrop, direction } = props;
  const { pos, eventKey } = nodeProps;

  // record the key of node which is latest entered, used in dragleave event.
  if (currentMouseOverDroppableNodeKey.value !== eventKey) {
    currentMouseOverDroppableNodeKey.value = eventKey;
  }

  if (!dragNodeProps.value) {
    resetDragState();
    return;
  }

  const { dropPosition, dropLevelOffset, dropTargetKey, dropContainerKey, dropTargetPos, dropAllowed, dragOverNodeKey } =
    calcDropPosition<TreeDataType>(
      event,
      dragNodeProps.value as TreeDataType,
      nodeProps,
      indent,
      dragStartMousePosition.value,
      allowDrop,
      flattenNodes as FlattenNode<TreeDataType>[],
      keyEntities,
      expandedKeys,
      direction,
    );

  if (
    // don't allow drop inside its children
    dragChildrenKeys.includes(dropTargetKey) ||
    // don't allow drop when drop is not allowed caculated by calcDropPosition
    !dropAllowed
  ) {
    resetDragState();
    return;
  }

  // Side effect for delay drag
  if (!delayedDragEnterLogic.value) {
    delayedDragEnterLogic.value = {};
  }
  Object.keys(delayedDragEnterLogic.value).forEach((key) => {
    clearTimeout(delayedDragEnterLogic.value[key]);
  });

  if (dragNodeProps.value.eventKey !== nodeProps.eventKey) {
    // hoist expand logic here
    // since if logic is on the bottom
    // it will be blocked by abstract dragover node check
    //   => if you dragenter from top, you mouse will still be consider as in the top node
    delayedDragEnterLogic.value[pos] = window.setTimeout(() => {
      if (state.draggingNodeKey === null) {
        return;
      }

      let newExpandedKeys = [...expandedKeys];
      const entity = getEntity(keyEntities, nodeProps.eventKey);

      if (entity && (entity.children || []).length) {
        newExpandedKeys = arrAdd(expandedKeys, nodeProps.eventKey);
      }

      if (!Reflect.has(props, 'expandedKeys')) {
        setExpandedKeys(newExpandedKeys);
      }

      onExpand?.(newExpandedKeys, {
        node: convertNodePropsToEventData<TreeDataType>(nodeProps),
        expanded: true,
        nativeEvent: event,
      });
    }, 800);
  }

  // Skip if drag node is self
  if (dragNodeProps.value.eventKey === dropTargetKey && dropLevelOffset === 0) {
    resetDragState();
    return;
  }

  // Update drag over node and drag state
  assign(state, { dragOverNodeKey, dropPosition, dropLevelOffset, dropTargetKey, dropContainerKey, dropTargetPos, dropAllowed });

  onDragEnter?.({
    event,
    node: convertNodePropsToEventData<TreeDataType>(nodeProps),
    expandedKeys,
  });
}

function onNodeDragOver(event: DragEvent, nodeProps: TreeNodeProps<TreeDataType>) {
  const { dragChildrenKeys, flattenNodes, keyEntities, expandedKeys, indent } = state;
  const { onDragOver, allowDrop, direction } = props;

  if (!dragNodeProps.value) {
    return;
  }

  const { dropPosition, dropLevelOffset, dropTargetKey, dropContainerKey, dropTargetPos, dropAllowed, dragOverNodeKey } =
    calcDropPosition<TreeDataType>(
      event,
      dragNodeProps.value as TreeNodeProps<TreeDataType>,
      nodeProps,
      indent,
      dragStartMousePosition.value,
      allowDrop,
      flattenNodes as FlattenNode<TreeDataType>[],
      keyEntities,
      expandedKeys,
      direction,
    );

  if (dragChildrenKeys.includes(dropTargetKey) || !dropAllowed) {
    // don't allow drop inside its children
    // don't allow drop when drop is not allowed calculated by calcDropPosition
    return;
  }

  // Update drag position

  if (dragNodeProps.value.eventKey === dropTargetKey && dropLevelOffset === 0) {
    if (
      !(
        state.dropPosition === null &&
        state.dropLevelOffset === null &&
        state.dropTargetKey === null &&
        state.dropContainerKey === null &&
        state.dropTargetPos === null &&
        state.dropAllowed === false &&
        state.dragOverNodeKey === null
      )
    ) {
      resetDragState();
    }
  } else if (
    !(
      dropPosition === state.dropPosition &&
      dropLevelOffset === state.dropLevelOffset &&
      dropTargetKey === state.dropTargetKey &&
      dropContainerKey === state.dropContainerKey &&
      dropTargetPos === state.dropTargetPos &&
      dropAllowed === state.dropAllowed &&
      dragOverNodeKey === state.dragOverNodeKey
    )
  ) {
    assign(state, {
      dropPosition,
      dropLevelOffset,
      dropTargetKey,
      dropContainerKey,
      dropTargetPos,
      dropAllowed,
      dragOverNodeKey,
    });
  }

  onDragOver?.({ event, node: convertNodePropsToEventData<TreeDataType>(nodeProps) });
}

function onNodeDragLeave(event, nodeProps) {
  // if it is outside the droppable area
  // currentMouseOverDroppableNodeKey will be updated in dragenter event when into another droppable receiver.
  if (
    currentMouseOverDroppableNodeKey.value === nodeProps.eventKey &&
    !event.currentTarget.contains(event.relatedTarget as Node)
  ) {
    resetDragState();
    currentMouseOverDroppableNodeKey.value = null;
  }

  const { onDragLeave } = props;

  onDragLeave?.({ event, node: convertNodePropsToEventData<TreeDataType>(nodeProps) });
}

// since stopPropagation() is called in treeNode
// if onWindowDrag is called, whice means state is keeped, drag state should be cleared
function onWindowDragEnd(event) {
  onNodeDragEnd(event, null);
  window.removeEventListener('dragend', onWindowDragEnd);
}

// if onNodeDragEnd is called, onWindowDragEnd won't be called since stopPropagation() is called
function onNodeDragEnd(event, nodeProps) {
  const { onDragEnd } = props;
  state.dragOverNodeKey = null;

  cleanDragState();

  onDragEnd?.({ event, node: convertNodePropsToEventData<TreeDataType>(nodeProps) });

  dragNodeProps.value = null;

  window.removeEventListener('dragend', onWindowDragEnd);
}

function onNodeDrop(event: DragEvent, _: TreeNodeProps<TreeDataType>, outsideTree: boolean = false) {
  const { dragChildrenKeys, dropPosition, dropTargetKey, dropTargetPos, dropAllowed } = state;
  if (!dropAllowed) {
    return;
  }

  const { onDrop } = props;

  state.dragOverNodeKey = null;
  cleanDragState();

  if (dropTargetKey === null) return;

  const abstractDropNodeProps = {
    ...getTreeNodeProps(dropTargetKey, getTreeNodeRequiredProps()),
    active: getActiveItem()?.key === dropTargetKey,
    data: getEntity(state.keyEntities, dropTargetKey).node,
  };

  const dropToChild = dragChildrenKeys.includes(dropTargetKey);

  warning(!dropToChild, "Can not drop to dragNode's children node. This is a bug of rc-tree. Please report an issue.");

  const posArr = posToArr(dropTargetPos);

  const dropResult = {
    event,
    node: convertNodePropsToEventData<TreeDataType>(abstractDropNodeProps),
    dragNode: dragNodeProps.value ? convertNodePropsToEventData(dragNodeProps.value) : null,
    dragNodesKeys: [dragNodeProps.value.eventKey].concat(dragChildrenKeys),
    dropToGap: dropPosition !== 0,
    dropPosition: dropPosition + Number(posArr[posArr.length - 1]),
  };

  if (!outsideTree) {
    onDrop?.(dropResult as any);
  }

  dragNodeProps.value = null;
}

function resetDragState() {
  state.dragOverNodeKey = null;
  state.dropPosition = null;
  state.dropLevelOffset = null;
  state.dropTargetKey = null;
  state.dropContainerKey = null;
  state.dropTargetPos = null;
  state.dropAllowed = false;
}

function cleanDragState() {
  const { draggingNodeKey } = state;
  if (draggingNodeKey !== null) {
    state.draggingNodeKey = null;
    state.dropPosition = null;
    state.dropContainerKey = null;
    state.dropTargetKey = null;
    state.dropLevelOffset = null;
    state.dropAllowed = null;
    state.dragOverNodeKey = null;
  }
  dragStartMousePosition.value = null;
  currentMouseOverDroppableNodeKey.value = null;
}

function triggerExpandActionExpand(e, treeNode) {
  const { expandedKeys, flattenNodes } = state;
  const { expanded, key, isLeaf } = treeNode;

  if (isLeaf || e.shiftKey || e.metaKey || e.ctrlKey) {
    return;
  }

  const node = flattenNodes.filter((nodeItem) => nodeItem.key === key)[0];
  const eventNode = convertNodePropsToEventData<TreeDataType>({
    ...getTreeNodeProps(key, getTreeNodeRequiredProps()),
    data: node.data as any,
  });

  setExpandedKeys(expanded ? arrDel(expandedKeys, key) : arrAdd(expandedKeys, key));
  onNodeExpand(e as MouseEvent, eventNode);
}

function onNodeClick(e, treeNode) {
  const { onClick, expandAction } = props;

  if (expandAction === 'click') {
    triggerExpandActionExpand(e, treeNode);
  }

  onClick?.(e, treeNode);
}

function onNodeDoubleClick(e, treeNode) {
  const { onDoubleClick, expandAction } = props;

  if (expandAction === 'doubleClick') {
    triggerExpandActionExpand(e, treeNode);
  }

  onDoubleClick?.(e, treeNode);
}

function onNodeSelect(e, treeNode) {
  let { selectedKeys } = state;
  const { keyEntities, fieldNames } = state;
  const { onSelect, multiple } = props;
  const { selected } = treeNode;
  const key = treeNode[fieldNames.key];
  const targetSelected = !selected;

  // Update selected keys
  if (!targetSelected) {
    selectedKeys = arrDel(selectedKeys, key);
  } else if (!multiple) {
    selectedKeys = [key];
  } else {
    selectedKeys = arrAdd(selectedKeys, key);
  }

  // [Legacy] Not found related usage in doc or upper libs
  const selectedNodes = selectedKeys
    .map((selectedKey) => {
      const entity = getEntity(keyEntities, selectedKey);
      return entity ? entity.node : null;
    })
    .filter(Boolean);

  setUncontrolledState({ selectedKeys });

  onSelect?.(selectedKeys, {
    event: 'select',
    selected: targetSelected,
    node: treeNode,
    selectedNodes,
    nativeEvent: e.nativeEvent,
  });
}

function onNodeCheck(e: MouseEvent, treeNode: EventDataNode<TreeDataType>, checked: boolean) {
  const { keyEntities, checkedKeys: oriCheckedKeys, halfCheckedKeys: oriHalfCheckedKeys } = state;
  const { checkStrictly, onCheck } = props;
  const { key } = treeNode;

  // Prepare trigger arguments
  let checkedObj: { checked: VueKey[]; halfChecked: VueKey[] } | VueKey[];

  const eventObj: Partial<CheckInfo<TreeDataType>> = {
    event: 'check',
    node: treeNode,
    checked,
    nativeEvent: e,
  };

  if (checkStrictly) {
    const checkedKeys = checked ? arrAdd(oriCheckedKeys, key) : arrDel(oriCheckedKeys, key);
    const halfCheckedKeys = arrDel(oriHalfCheckedKeys, key);
    checkedObj = { checked: checkedKeys, halfChecked: halfCheckedKeys };

    eventObj.checkedNodes = checkedKeys
      .map((checkedKey) => getEntity(keyEntities, checkedKey))
      .filter(Boolean)
      .map((entity) => entity.node);

    setUncontrolledState({ checkedKeys });
  } else {
    // Always fill first
    let { checkedKeys, halfCheckedKeys } = conductCheck([...oriCheckedKeys, key], true, keyEntities);

    // If remove, we do it again to correction
    if (!checked) {
      const keySet = new Set(checkedKeys);
      keySet.delete(key);
      ({ checkedKeys, halfCheckedKeys } = conductCheck(Array.from(keySet), { checked: false, halfCheckedKeys }, keyEntities));
    }

    checkedObj = checkedKeys;

    // [Legacy] This is used for `rc-tree-select`
    eventObj.checkedNodes = [];
    eventObj.checkedNodesPositions = [];
    eventObj.halfCheckedKeys = halfCheckedKeys;

    checkedKeys.forEach((checkedKey) => {
      const entity = getEntity(keyEntities, checkedKey);
      if (!entity) return;

      const { node, pos } = entity;

      eventObj.checkedNodes.push(node);
      eventObj.checkedNodesPositions.push({ node, pos });
    });

    setUncontrolledState({ checkedKeys }, false, { halfCheckedKeys });
  }

  onCheck?.(checkedObj, eventObj as CheckInfo<TreeDataType>);
}

function onNodeLoad(treeNode: EventDataNode<TreeDataType>) {
  const { key } = treeNode;
  const { keyEntities } = state;

  // Skip if has children already
  const entity = getEntity(keyEntities, key);
  if (entity?.children?.length) {
    return;
  }

  const loadPromise = new Promise<void>((resolve, reject) => {
    // We need to get the latest state of loading/loaded keys
    const { loadData, onLoad } = props;
    const { loadedKeys = [], loadingKeys = [] } = state;

    if (!loadData || loadedKeys.includes(key) || loadingKeys.includes(key)) {
      assign(state, null);
    }

    // Process load data
    const promise = loadData(treeNode);
    promise
      .then(() => {
        const { loadedKeys: currentLoadedKeys } = state;
        const newLoadedKeys = arrAdd(currentLoadedKeys, key);

        // onLoad should trigger before internal setState to avoid `loadData` trigger twice.
        // https://github.com/ant-design/ant-design/issues/12464
        onLoad?.(newLoadedKeys, {
          event: 'load',
          node: treeNode,
        });

        setUncontrolledState({
          loadedKeys: newLoadedKeys,
        });
        state.loadingKeys = arrDel(state.loadingKeys, key);
        resolve();
      })
      .catch((e) => {
        state.loadingKeys = arrDel(state.loadingKeys, key);

        // If exceed max retry times, we give up retry
        loadingRetryTimes[key as VueKey] = (loadingRetryTimes[key as VueKey] || 0) + 1;
        if (loadingRetryTimes[key as VueKey] >= MAX_RETRY_TIMES) {
          const { loadedKeys: currentLoadedKeys } = state;

          warning(false, 'Retry for `loadData` many times but still failed. No more retry.');

          setUncontrolledState({
            loadedKeys: arrAdd(currentLoadedKeys, key),
          });
          resolve();
        }

        reject(e);
      });
    state.loadingKeys = arrAdd(loadingKeys, key);
  });

  // Not care warning if we ignore this
  loadPromise.catch(() => {});

  return loadPromise;
}

function onNodeMouseEnter(event, node) {
  const { onMouseEnter } = props;

  onMouseEnter?.({ event, node });
}

function onNodeMouseLeave(event, node) {
  const { onMouseLeave } = props;

  onMouseLeave?.({ event, node });
}

function onNodeContextMenu(event, node) {
  const { onRightClick } = props;
  if (onRightClick) {
    event.preventDefault();
    onRightClick({ event, node });
  }
}

function onInnerFocus(e) {
  const { onFocus } = props;
  state.focused = true;
  onFocus?.(e);
}

function onInnerBlur(e) {
  const { onBlur } = props;
  state.focused = false;
  onInnerActiveChange(null);

  onBlur?.(e);
}

function getTreeNodeRequiredProps() {
  const {
    expandedKeys,
    selectedKeys,
    loadedKeys,
    loadingKeys,
    checkedKeys,
    halfCheckedKeys,
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  } = state;
  return {
    expandedKeys: expandedKeys || [],
    selectedKeys: selectedKeys || [],
    loadedKeys: loadedKeys || [],
    loadingKeys: loadingKeys || [],
    checkedKeys: checkedKeys || [],
    halfCheckedKeys: halfCheckedKeys || [],
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  };
}

// =========================== Expanded ===========================
/** Set uncontrolled `expandedKeys`. This will also auto update `flattenNodes`. */
function setExpandedKeys(expandedKeys: VueKey[]) {
  const { treeData, fieldNames } = state;
  const flattenNodes = flattenTreeData<TreeDataType>(treeData as TreeDataType[], expandedKeys, fieldNames);
  setUncontrolledState({ expandedKeys, flattenNodes }, true);
}

function onNodeExpand(e: MouseEvent, treeNode: EventDataNode<TreeDataType>) {
  let { expandedKeys } = state;
  const { listChanging, fieldNames } = state;
  const { onExpand, loadData } = props;
  const { expanded } = treeNode;
  const key = treeNode[fieldNames.key];
  // Do nothing when motion is in progress
  if (listChanging) {
    return;
  }

  // Update selected keys
  const certain = expandedKeys.includes(key);
  const targetExpanded = !expanded;

  warning((expanded && certain) || (!expanded && !certain), 'Expand state not sync with index check');

  expandedKeys = targetExpanded ? arrAdd(expandedKeys, key) : arrDel(expandedKeys, key);

  setExpandedKeys(expandedKeys);

  onExpand?.(expandedKeys, {
    node: treeNode,
    expanded: targetExpanded,
    nativeEvent: e,
  });

  // Async Load data
  if (targetExpanded && loadData) {
    const loadPromise = onNodeLoad(treeNode);
    if (loadPromise) {
      loadPromise
        .then(() => {
          // [Legacy] Refresh logic
          const newFlattenTreeData = flattenTreeData<TreeDataType>(state.treeData as any, expandedKeys, fieldNames);
          setUncontrolledState({ flattenNodes: newFlattenTreeData });
        })
        .catch(() => {
          const { expandedKeys: currentExpandedKeys } = state;
          const expandedKeysToRestore = arrDel(currentExpandedKeys, key);
          setExpandedKeys(expandedKeysToRestore);
        });
    }
  }
}

function onListChangeStart() {
  setUncontrolledState({
    listChanging: true,
  });
}

function onListChangeEnd() {
  setTimeout(() => {
    setUncontrolledState({
      listChanging: false,
    });
  });
}

// =========================== Keyboard ===========================
function onInnerActiveChange(newActiveKey: VueKey | null) {
  const { activeKey } = state;
  const { onActiveChange, itemScrollOffset = 0 } = props;

  if (activeKey === newActiveKey) {
    return;
  }

  state.activeKey = newActiveKey;
  if (newActiveKey !== null) {
    scrollTo({ key: newActiveKey, offset: itemScrollOffset });
  }

  onActiveChange?.(newActiveKey);
}

function getActiveItem() {
  const { activeKey, flattenNodes } = state;
  if (activeKey === null) {
    return null;
  }

  return flattenNodes.find(({ key }) => key === activeKey) || null;
}

function offsetActiveKey(offset: number) {
  const { flattenNodes, activeKey } = state;

  let index = flattenNodes.findIndex(({ key }) => key === activeKey);

  // Align with index
  if (index === -1 && offset < 0) {
    index = flattenNodes.length;
  }

  index = (index + offset + flattenNodes.length) % flattenNodes.length;

  const item = flattenNodes[index];
  if (item) {
    const { key } = item;
    onInnerActiveChange(key);
  } else {
    onInnerActiveChange(null);
  }
}

function onKeyDown(event) {
  const { activeKey, expandedKeys, checkedKeys, fieldNames } = state;
  const { onKeydown, checkable, selectable } = props;

  // >>>>>>>>>> Direction
  switch (event.which) {
    case KeyCode.UP: {
      offsetActiveKey(-1);
      event.preventDefault();
      break;
    }
    case KeyCode.DOWN: {
      offsetActiveKey(1);
      event.preventDefault();
      break;
    }
  }

  // >>>>>>>>>> Expand & Selection
  const activeItem = getActiveItem();
  if (activeItem && activeItem.data) {
    const treeNodeRequiredProps = getTreeNodeRequiredProps();

    const expandable = activeItem.data.isLeaf === false || !!(activeItem.data[fieldNames.children] || []).length;
    const eventNode = convertNodePropsToEventData<TreeDataType>({
      ...getTreeNodeProps(activeKey, treeNodeRequiredProps),
      data: activeItem.data as TreeDataType,
      active: true,
    });

    switch (event.which) {
      // >>> Expand
      case KeyCode.LEFT: {
        // Collapse if possible
        if (expandable && expandedKeys.includes(activeKey)) {
          onNodeExpand({} as MouseEvent, eventNode);
        } else if (activeItem.parent) {
          onInnerActiveChange(activeItem.parent.key);
        }
        event.preventDefault();
        break;
      }
      case KeyCode.RIGHT: {
        // Expand if possible
        if (expandable && !expandedKeys.includes(activeKey)) {
          onNodeExpand({} as MouseEvent, eventNode);
        } else if (activeItem.children && activeItem.children.length) {
          onInnerActiveChange(activeItem.children[0].key);
        }
        event.preventDefault();
        break;
      }

      // Selection
      case KeyCode.ENTER:
      case KeyCode.SPACE: {
        if (checkable && !eventNode.disabled && eventNode.checkable !== false && !eventNode.disableCheckbox) {
          onNodeCheck({} as MouseEvent, eventNode, !checkedKeys.includes(activeKey));
        } else if (!checkable && selectable && !eventNode.disabled && eventNode.selectable !== false) {
          onNodeSelect({} as MouseEvent, eventNode);
        }
        break;
      }
    }
  }

  onKeydown?.(event);
}

/**
 * Only update the value which is not in props
 */
function setUncontrolledState(
  data: Partial<TreeState<TreeDataType>>,
  atomic: boolean = false,
  forceState: Partial<TreeState<TreeDataType>> | null = null,
) {
  if (!destroyed.value) {
    let needSync = false;
    let allPassed = true;
    const newState = {};

    Object.keys(data).forEach((name) => {
      if (Reflect.has(JSON.parse(JSON.stringify(props)), name)) {
        allPassed = false;
        return;
      }
      needSync = true;
      newState[name] = data[name];
    });

    if (needSync && (!atomic || allPassed)) {
      assign(state, {
        ...newState,
        ...forceState,
      });
    }
  }
}

function scrollTo(scroll) {
  listRef.value?.scrollTo(scroll);
}
const attrs = useAttrs();
const domProps = computed(() => pickAttrs({ ...props, ...attrs }, { aria: true, data: true }));

const draggableConfig = computed(() => {
  // It's better move to hooks but we just simply keep here
  let result: DraggableConfig;
  if (props.draggable) {
    if (typeof props.draggable === 'object') {
      result = props.draggable;
    } else if (typeof props.draggable === 'function') {
      result = {
        nodeDraggable: props.draggable,
      };
    } else {
      result = {};
    }
  }
  return result;
});

const contextValue = computed(() => {
  return {
    styles: props.styles,
    classNames: props.classNames,
    prefixCls: props.prefixCls,
    selectable: props.selectable,
    showIcon: props.showIcon,
    icon: props.icon,
    switcherIcon: props.switcherIcon,
    draggable: draggableConfig.value,
    draggingNodeKey: state.draggingNodeKey,
    checkable: props.checkable,
    checkStrictly: props.checkStrictly,
    disabled: props.disabled,
    keyEntities: state.keyEntities,
    dropLevelOffset: state.dropLevelOffset,
    dropContainerKey: state.dropContainerKey,
    dropTargetKey: state.dropTargetKey,
    dropPosition: state.dropPosition,
    dragOverNodeKey: state.dragOverNodeKey,
    indent: state.indent,
    direction: props.direction,
    dropIndicatorRender: props.dropIndicatorRender,
    loadData: props.loadData,
    filterTreeNode: props.filterTreeNode,
    titleRender: props.titleRender,
    onNodeClick,
    onNodeDoubleClick,
    onNodeExpand,
    onNodeSelect,
    onNodeCheck,
    onNodeLoad,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onNodeContextMenu,
    onNodeDragStart,
    onNodeDragEnter,
    onNodeDragOver,
    onNodeDragLeave,
    onNodeDragEnd,
    onNodeDrop,
  } as any;
});

defineExpose({
  scrollTo,
  onKeydown: onKeyDown,
});
</script>
<template>
  <TreeContextProvider :value="contextValue">
    <div
      :class="
        clsx(prefixCls, props.class, rootClassName, {
          [`${prefixCls}-show-line`]: showLine,
          [`${prefixCls}-focused`]: state.focused,
          [`${prefixCls}-active-focused`]: activeKey !== null,
        })
      "
      :style="rootStyle"
    >
      <NodeList
        ref="listRef"
        :prefix-cls="prefixCls"
        :style="style"
        :data="state.flattenNodes"
        :disabled="disabled"
        :selectable="selectable"
        :checkable="!!checkable"
        :motion="motion"
        :dragging="state.draggingNodeKey !== null"
        :height="height"
        :item-height="itemHeight"
        :virtual="virtual"
        :focusable="focusable"
        :focused="state.focused"
        :tabindex="tabindex"
        :active-item="getActiveItem()"
        @focus="onInnerFocus"
        @blur="onInnerBlur"
        @keydown="onKeyDown"
        @active-change="onInnerActiveChange"
        @list-change-start="onListChangeStart"
        @list-change-end="onListChangeEnd"
        @contextmenu="onContextmenu"
        @scroll="onScroll"
        :scroll-width="scrollWidth"
        v-bind="{ ...getTreeNodeRequiredProps(), ...domProps }"
      />
    </div>
  </TreeContextProvider>
</template>
