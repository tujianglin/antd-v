<!-- eslint-disable vue/no-dupe-keys -->
<script lang="tsx" setup generic="TreeDataType extends BasicDataNode = DataNode">
import KeyCode from '@/vc-util/KeyCode';
import pickAttrs from '@/vc-util/pickAttrs';
import type { VueKey } from '@/vc-util/type';
import warning from '@/vc-util/warning';
import clsx from 'clsx';
import { assign } from 'lodash-es';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useAttrs,
  useTemplateRef,
  watch,
  watchEffect,
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
  type DataEntity,
  type DataNode,
  type Direction,
  type EventDataNode,
  type FieldNames,
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
  dropIndicatorRender: DropIndicator,
  allowDrop: () => true,
  expandAction: false,
  tabindex: 0,
  virtual: true,
});

const defaultExpandedKeys = defineModel<VueKey[]>('expandedKeys');
const defaultCheckedKeys = defineModel<VueKey[] | { checked: VueKey[]; halfChecked: VueKey[] }>('checkedKeys');
const defaultSelectedKeys = defineModel<VueKey[]>('selectedKeys');

const MAX_RETRY_TIMES = 10;

const destroyed = ref(false);

const delayedDragEnterLogic = ref<Record<VueKey, number>>();

const loadingRetryTimes = ref<Record<VueKey, number>>({});

const keyEntities = ref<KeyEntities<TreeDataType>>({});
const indent = ref();
const selectedKeys = ref([]);
const checkedKeys = ref([]);
const halfCheckedKeys = ref([]);
const loadedKeys = ref([]);
const loadingKeys = ref([]);
const expandedKeys = ref([]);

const treeData = ref<TreeDataType[]>();
const flattenNodes = ref([]);

const focused = ref(false);
const activeKey = ref(null);

const listChanging = ref(false);

const fieldNames = computed(() => fillFieldNames(props.fieldNames));

const dragState = reactive({
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
});

// ================== Tree Node ==================
watch(
  [() => props.treeData],
  () => {
    treeData.value = props.treeData.slice();
  },
  { immediate: true, deep: true },
);

watchEffect(() => {
  if (treeData.value) {
    const entitiesMap = convertDataToEntities(treeData.value, {
      fieldNames: fieldNames.value,
    });
    keyEntities.value = {
      [MOTION_KEY]: MotionEntity as unknown as DataEntity<TreeDataType>,
      ...entitiesMap.keyEntities,
    };
  }
});

// ================ expandedKeys =================
let init = false; // 处理 defaultXxxx api, 仅仅首次有效

watch(
  [() => defaultExpandedKeys.value, () => props.autoExpandParent, keyEntities],
  ([_newKeys, newAutoExpandParent], [_oldKeys, oldAutoExpandParent]) => {
    let keys = expandedKeys.value;
    // ================ expandedKeys =================
    if (defaultExpandedKeys.value !== undefined || (init && newAutoExpandParent !== oldAutoExpandParent)) {
      keys =
        props.autoExpandParent || (!init && props.defaultExpandParent)
          ? conductExpandParent(defaultExpandedKeys.value, keyEntities.value)
          : defaultExpandedKeys.value;
    } else if (!init && props.defaultExpandAll) {
      const cloneKeyEntities = { ...keyEntities.value };
      delete cloneKeyEntities[MOTION_KEY];

      // Only take the key who has the children to enhance the performance
      const nextExpandedKeys: VueKey[] = [];
      Object.keys(cloneKeyEntities).forEach((key) => {
        const entity = cloneKeyEntities[key];
        if (entity.children && entity.children.length) {
          nextExpandedKeys.push(entity.key);
        }
      });
      keys = nextExpandedKeys;
    }

    if (keys) {
      expandedKeys.value = keys;
    }
    init = true;
  },
  { immediate: true },
);

// ================ flattenNodes =================
watchEffect(() => {
  flattenNodes.value = flattenTreeData(treeData.value, expandedKeys.value, fieldNames.value);
});

// ================ selectedKeys =================
watchEffect(() => {
  if (props.selectable) {
    if (defaultSelectedKeys.value !== undefined) {
      selectedKeys.value = calcSelectedKeys(defaultSelectedKeys.value, props as unknown as TreeProps<DataNode>);
    }
  }
});

// ================= checkedKeys =================
watchEffect(() => {
  if (props.checkable) {
    let checkedKeyEntity;

    if (defaultCheckedKeys.value !== undefined) {
      checkedKeyEntity = parseCheckedKeys(defaultCheckedKeys.value) || {};
    } else if (treeData.value) {
      // If `treeData` changed, we also need check it
      checkedKeyEntity = parseCheckedKeys(defaultCheckedKeys.value) || {
        checkedKeys: checkedKeys.value,
        halfCheckedKeys: halfCheckedKeys.value,
      };
    }

    if (checkedKeyEntity) {
      let { checkedKeys: newCheckedKeys = [], halfCheckedKeys: newHalfCheckedKeys = [] } = checkedKeyEntity;

      if (!props.checkStrictly) {
        const conductKeys = conductCheck(newCheckedKeys, true, keyEntities.value);
        ({ checkedKeys: newCheckedKeys, halfCheckedKeys: newHalfCheckedKeys } = conductKeys);
      }

      checkedKeys.value = newCheckedKeys;
      halfCheckedKeys.value = newHalfCheckedKeys;
    }
  }
});

// ================= loadedKeys ==================
watchEffect(() => {
  if (props.loadedKeys) {
    loadedKeys.value = props.loadedKeys;
  }
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
  const { itemScrollOffset = 0 } = props;
  if (props.activeKey !== undefined && props.activeKey !== activeKey.value) {
    activeKey.value = activeKey;

    if (props.activeKey !== null) {
      scrollTo({ key: activeKey, offset: itemScrollOffset });
    }
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('dragend', onWindowDragEnd);
  destroyed.value = true;
});

function onNodeDragStart(event, nodeProps) {
  const { onDragStart } = props;
  const { eventKey } = nodeProps;

  dragNodeProps.value = nodeProps;
  dragStartMousePosition.value = {
    x: event.clientX,
    y: event.clientY,
  };

  const newExpandedKeys = arrDel(expandedKeys.value, eventKey);

  dragState.draggingNodeKey = eventKey;
  dragState.dragChildrenKeys = getDragChildrenKeys(eventKey, keyEntities.value);
  indent.value = listRef.value.getIndentWidth();

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
  const { dragChildrenKeys } = dragState;
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
      indent.value,
      dragStartMousePosition.value,
      allowDrop,
      flattenNodes.value,
      keyEntities.value,
      expandedKeys.value,
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
      if (dragState.draggingNodeKey === null) {
        return;
      }

      let newExpandedKeys = [...expandedKeys.value];
      const entity = getEntity(keyEntities.value, nodeProps.eventKey);

      if (entity && (entity.children || []).length) {
        newExpandedKeys = arrAdd(expandedKeys.value, nodeProps.eventKey);
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
  assign(dragState, {
    dragOverNodeKey,
    dropPosition,
    dropLevelOffset,
    dropTargetKey,
    dropContainerKey,
    dropTargetPos,
    dropAllowed,
  });

  onDragEnter?.({
    event,
    node: convertNodePropsToEventData<TreeDataType>(nodeProps),
    expandedKeys: expandedKeys.value,
  });
}

function onNodeDragOver(event: DragEvent, nodeProps: TreeNodeProps<TreeDataType>) {
  const { dragChildrenKeys } = dragState;
  const { onDragOver, allowDrop, direction } = props;

  if (!dragNodeProps.value) {
    return;
  }

  const { dropPosition, dropLevelOffset, dropTargetKey, dropContainerKey, dropTargetPos, dropAllowed, dragOverNodeKey } =
    calcDropPosition<TreeDataType>(
      event,
      dragNodeProps.value as TreeNodeProps<TreeDataType>,
      nodeProps,
      indent.value,
      dragStartMousePosition.value,
      allowDrop,
      flattenNodes.value,
      keyEntities.value,
      expandedKeys.value,
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
        dragState.dropPosition === null &&
        dragState.dropLevelOffset === null &&
        dragState.dropTargetKey === null &&
        dragState.dropContainerKey === null &&
        dragState.dropTargetPos === null &&
        dragState.dropAllowed === false &&
        dragState.dragOverNodeKey === null
      )
    ) {
      resetDragState();
    }
  } else if (
    !(
      dropPosition === dragState.dropPosition &&
      dropLevelOffset === dragState.dropLevelOffset &&
      dropTargetKey === dragState.dropTargetKey &&
      dropContainerKey === dragState.dropContainerKey &&
      dropTargetPos === dragState.dropTargetPos &&
      dropAllowed === dragState.dropAllowed &&
      dragOverNodeKey === dragState.dragOverNodeKey
    )
  ) {
    assign(dragState, {
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
  dragState.dragOverNodeKey = null;

  cleanDragState();

  onDragEnd?.({ event, node: convertNodePropsToEventData<TreeDataType>(nodeProps) });

  dragNodeProps.value = null;

  window.removeEventListener('dragend', onWindowDragEnd);
}

function onNodeDrop(event: DragEvent, _: TreeNodeProps<TreeDataType>, outsideTree: boolean = false) {
  const { dragChildrenKeys, dropPosition, dropTargetKey, dropTargetPos, dropAllowed } = dragState;
  if (!dropAllowed) {
    return;
  }

  const { onDrop } = props;

  dragState.dragOverNodeKey = null;
  cleanDragState();

  if (dropTargetKey === null) return;

  const abstractDropNodeProps = {
    ...getTreeNodeProps(dropTargetKey, getTreeNodeRequiredProps()),
    active: getActiveItem()?.key === dropTargetKey,
    data: getEntity(keyEntities.value, dropTargetKey).node,
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
  dragState.dragOverNodeKey = null;
  dragState.dropPosition = null;
  dragState.dropLevelOffset = null;
  dragState.dropTargetKey = null;
  dragState.dropContainerKey = null;
  dragState.dropTargetPos = null;
  dragState.dropAllowed = false;
}

function cleanDragState() {
  const { draggingNodeKey } = dragState;
  if (draggingNodeKey !== null) {
    dragState.draggingNodeKey = null;
    dragState.dropPosition = null;
    dragState.dropContainerKey = null;
    dragState.dropTargetKey = null;
    dragState.dropLevelOffset = null;
    dragState.dropAllowed = null;
    dragState.dragOverNodeKey = null;
  }
  dragStartMousePosition.value = null;
  currentMouseOverDroppableNodeKey.value = null;
}

function triggerExpandActionExpand(e, treeNode) {
  const { expanded, key, isLeaf } = treeNode;

  if (isLeaf || e.shiftKey || e.metaKey || e.ctrlKey) {
    return;
  }

  const node = flattenNodes.value.filter((nodeItem) => nodeItem.key === key)[0];
  const eventNode = convertNodePropsToEventData<TreeDataType>({
    ...getTreeNodeProps(key, getTreeNodeRequiredProps()),
    data: node.data as any,
  });

  setExpandedKeys(expanded ? arrDel(expandedKeys.value, key) : arrAdd(expandedKeys.value, key));
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
  let newSelectedKeys = selectedKeys.value;
  const { onSelect, multiple } = props;
  const { selected } = treeNode;
  const key = treeNode[fieldNames.value.key];
  const targetSelected = !selected;

  // Update selected keys
  if (!targetSelected) {
    newSelectedKeys = arrDel(newSelectedKeys, key);
  } else if (!multiple) {
    newSelectedKeys = [key];
  } else {
    newSelectedKeys = arrAdd(newSelectedKeys, key);
  }

  // [Legacy] Not found related usage in doc or upper libs
  const selectedNodes = newSelectedKeys
    .map((selectedKey) => {
      const entity = getEntity(keyEntities.value, selectedKey);
      return entity ? entity.node : null;
    })
    .filter(Boolean);

  selectedKeys.value = newSelectedKeys;
  defaultSelectedKeys.value = newSelectedKeys;
  onSelect?.(newSelectedKeys, {
    event: 'select',
    selected: targetSelected,
    node: treeNode,
    selectedNodes,
    nativeEvent: e,
  });
}

function onNodeCheck(e: MouseEvent, treeNode: EventDataNode<TreeDataType>, checked: boolean) {
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
    const newCheckedKeys = checked ? arrAdd(checkedKeys.value, key) : arrDel(checkedKeys.value, key);
    const newHalfCheckedKeys = arrDel(halfCheckedKeys.value, key);
    checkedObj = { checked: newCheckedKeys, halfChecked: newHalfCheckedKeys };

    eventObj.checkedNodes = newCheckedKeys
      .map((checkedKey) => getEntity(keyEntities.value, checkedKey))
      .filter(Boolean)
      .map((entity) => entity.node);

    checkedKeys.value = newCheckedKeys;
  } else {
    // Always fill first
    let { checkedKeys: newCheckedKeys, halfCheckedKeys: newHalfCheckedKeys } = conductCheck(
      [...checkedKeys.value, key],
      true,
      keyEntities.value,
    );

    // If remove, we do it again to correction
    if (!checked) {
      const keySet = new Set(newCheckedKeys);
      keySet.delete(key);
      ({ checkedKeys: newCheckedKeys, halfCheckedKeys: newHalfCheckedKeys } = conductCheck(
        Array.from(keySet),
        { checked: false, halfCheckedKeys: newHalfCheckedKeys },
        keyEntities.value,
      ));
    }

    checkedObj = newCheckedKeys;

    // [Legacy] This is used for `rc-tree-select`
    eventObj.checkedNodes = [];
    eventObj.checkedNodesPositions = [];
    eventObj.halfCheckedKeys = newHalfCheckedKeys;

    newCheckedKeys.forEach((checkedKey) => {
      const entity = getEntity(keyEntities.value, checkedKey);
      if (!entity) return;

      const { node, pos } = entity;

      eventObj.checkedNodes.push(node);
      eventObj.checkedNodesPositions.push({ node, pos });
    });

    checkedKeys.value = newCheckedKeys;
    halfCheckedKeys.value = newHalfCheckedKeys;
  }
  defaultCheckedKeys.value = checkedKeys.value;
  onCheck?.(checkedObj, eventObj as CheckInfo<TreeDataType>);
}

function onNodeLoad(treeNode: EventDataNode<TreeDataType>) {
  const { key } = treeNode;

  // Skip if has children already
  const entity = getEntity(keyEntities.value, key);
  if (entity?.children?.length) {
    return;
  }

  const loadPromise = new Promise<void>((resolve, reject) => {
    // We need to get the latest state of loading/loaded keys
    const { loadData, onLoad } = props;

    if (!loadData || loadedKeys.value.includes(key) || loadingKeys.value.includes(key)) {
      assign(dragState, null);
    }

    // Process load data
    const promise = loadData(treeNode);
    promise
      .then(() => {
        const newLoadedKeys = arrAdd(loadedKeys.value, key);

        // onLoad should trigger before internal setState to avoid `loadData` trigger twice.
        // https://github.com/ant-design/ant-design/issues/12464
        onLoad?.(newLoadedKeys, {
          event: 'load',
          node: treeNode,
        });

        loadedKeys.value = newLoadedKeys;
        loadingKeys.value = arrDel(loadingKeys.value, key);
        resolve();
      })
      .catch((e) => {
        loadingKeys.value = arrDel(loadingKeys.value, key);

        // If exceed max retry times, we give up retry
        loadingRetryTimes[key as VueKey] = (loadingRetryTimes[key as VueKey] || 0) + 1;
        if (loadingRetryTimes[key as VueKey] >= MAX_RETRY_TIMES) {
          warning(false, 'Retry for `loadData` many times but still failed. No more retry.');

          loadedKeys.value = arrAdd(loadedKeys.value, key);
          resolve();
        }

        reject(e);
      });
    loadingKeys.value = arrAdd(loadingKeys.value, key);
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
  focused.value = true;
  onFocus?.(e);
}

function onInnerBlur(e) {
  const { onBlur } = props;
  focused.value = false;
  onInnerActiveChange(null);

  onBlur?.(e);
}

function getTreeNodeRequiredProps() {
  const { dragOverNodeKey, dropPosition } = dragState;
  return {
    expandedKeys: expandedKeys.value || [],
    selectedKeys: selectedKeys.value || [],
    loadedKeys: loadedKeys.value || [],
    loadingKeys: loadingKeys.value || [],
    checkedKeys: checkedKeys.value || [],
    halfCheckedKeys: halfCheckedKeys.value || [],
    dragOverNodeKey,
    dropPosition,
    keyEntities: keyEntities.value,
  };
}

// =========================== Expanded ===========================
/** Set uncontrolled `expandedKeys`. This will also auto update `flattenNodes`. */
function setExpandedKeys(newExpandedKeys: VueKey[]) {
  const newFlattenNodes = flattenTreeData<TreeDataType>(treeData.value, newExpandedKeys, fieldNames.value);
  expandedKeys.value = newExpandedKeys;
  defaultExpandedKeys.value = newExpandedKeys;
  flattenNodes.value = newFlattenNodes;
}

function onNodeExpand(e: MouseEvent, treeNode: EventDataNode<TreeDataType>) {
  const { onExpand, loadData } = props;
  const { expanded } = treeNode;
  const key = treeNode[fieldNames.value.key];
  // Do nothing when motion is in progress
  if (listChanging.value) {
    return;
  }

  // Update selected keys
  const certain = expandedKeys.value.includes(key);
  const targetExpanded = !expanded;

  warning((expanded && certain) || (!expanded && !certain), 'Expand state not sync with index check');

  expandedKeys.value = targetExpanded ? arrAdd(expandedKeys.value, key) : arrDel(expandedKeys.value, key);

  setExpandedKeys(expandedKeys.value);

  onExpand?.(expandedKeys.value, {
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
          const newFlattenTreeData = flattenTreeData<TreeDataType>(treeData.value, expandedKeys.value, fieldNames.value);
          flattenNodes.value = newFlattenTreeData;
        })
        .catch(() => {
          const expandedKeysToRestore = arrDel(expandedKeys.value, key);
          setExpandedKeys(expandedKeysToRestore);
        });
    }
  }
}

function onListChangeStart() {
  listChanging.value = true;
}

function onListChangeEnd() {
  setTimeout(() => {
    listChanging.value = false;
  });
}

// =========================== Keyboard ===========================
function onInnerActiveChange(newActiveKey: VueKey | null) {
  const { onActiveChange, itemScrollOffset = 0 } = props;

  if (activeKey.value === newActiveKey) {
    return;
  }

  activeKey.value = newActiveKey;
  if (newActiveKey !== null) {
    scrollTo({ key: newActiveKey, offset: itemScrollOffset });
  }

  onActiveChange?.(newActiveKey);
}

function getActiveItem() {
  if (activeKey.value === null) {
    return null;
  }

  return flattenNodes.value.find(({ key }) => key === activeKey.value) || null;
}

function offsetActiveKey(offset: number) {
  let index = flattenNodes.value.findIndex(({ key }) => key === activeKey.value);

  // Align with index
  if (index === -1 && offset < 0) {
    index = flattenNodes.value.length;
  }

  index = (index + offset + flattenNodes.value.length) % flattenNodes.value.length;

  const item = flattenNodes.value[index];
  if (item) {
    const { key } = item;
    onInnerActiveChange(key);
  } else {
    onInnerActiveChange(null);
  }
}

function onKeyDown(event) {
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

    const expandable = activeItem.data.isLeaf === false || !!(activeItem.data[fieldNames.value.children] || []).length;
    const eventNode = convertNodePropsToEventData<TreeDataType>({
      ...getTreeNodeProps(activeKey.value, treeNodeRequiredProps),
      data: activeItem.data as TreeDataType,
      active: true,
    });

    switch (event.which) {
      // >>> Expand
      case KeyCode.LEFT: {
        // Collapse if possible
        if (expandable && expandedKeys.value.includes(activeKey.value)) {
          onNodeExpand({} as MouseEvent, eventNode);
        } else if (activeItem.parent) {
          onInnerActiveChange(activeItem.parent.key);
        }
        event.preventDefault();
        break;
      }
      case KeyCode.RIGHT: {
        // Expand if possible
        if (expandable && !expandedKeys.value.includes(activeKey.value)) {
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
          onNodeCheck({} as MouseEvent, eventNode, !checkedKeys.value.includes(activeKey.value));
        } else if (!checkable && selectable && !eventNode.disabled && eventNode.selectable !== false) {
          onNodeSelect({} as MouseEvent, eventNode);
        }
        break;
      }
    }
  }

  onKeydown?.(event);
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
    draggingNodeKey: dragState.draggingNodeKey,
    checkable: props.checkable,
    checkStrictly: props.checkStrictly,
    disabled: props.disabled,
    keyEntities: keyEntities.value,
    dropLevelOffset: dragState.dropLevelOffset,
    dropContainerKey: dragState.dropContainerKey,
    dropTargetKey: dragState.dropTargetKey,
    dropPosition: dragState.dropPosition,
    dragOverNodeKey: dragState.dragOverNodeKey,
    indent: indent.value,
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
          [`${prefixCls}-focused`]: focused,
          [`${prefixCls}-active-focused`]: activeKey !== null,
        })
      "
      :style="rootStyle"
    >
      <NodeList
        ref="listRef"
        :prefix-cls="prefixCls"
        :style="style"
        :data="flattenNodes"
        :disabled="disabled"
        :selectable="selectable"
        :checkable="!!checkable"
        :motion="motion"
        :dragging="dragState.draggingNodeKey !== null"
        :height="height"
        :item-height="itemHeight"
        :virtual="virtual"
        :focusable="focusable"
        :focused="focused"
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
