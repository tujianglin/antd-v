<script lang="tsx" setup>
import VirtualList, { type ListRef } from '@/vc-component/virtual-list';
import type { ScrollTo } from '@/vc-component/virtual-list/interface';
import { computed, nextTick, ref, toRaw, watch, type CSSProperties } from 'vue';
import { MOTION_KEY, MotionEntity, type BasicDataNode, type DataNode, type FlattenNode, type KeyEntities } from './interface';
import { getMinimumRangeTransitionRange } from './util';
import { findExpandedKeys, getExpandRange } from './utils/diffUtil';
import { getKey, getTreeNodeProps } from './utils/treeUtil';
import MotionTreeNode from './MotionTreeNode.vue';
import { isEqual } from 'lodash-es';
import type { VueKey } from '@/vc-util/type';
export interface NodeListRef {
  scrollTo: ScrollTo;
  getIndentWidth: () => number;
}

interface NodeListProps<TreeDataType extends BasicDataNode> {
  prefixCls: string;
  style: CSSProperties;
  data: FlattenNode<TreeDataType>[];
  motion: any;
  focusable?: boolean;
  activeItem: FlattenNode<TreeDataType> | null;
  focused?: boolean;
  tabindex: number;
  checkable?: boolean;
  selectable?: boolean;
  disabled?: boolean;

  expandedKeys: VueKey[];
  selectedKeys: VueKey[];
  checkedKeys: VueKey[];
  loadedKeys: VueKey[];
  loadingKeys: VueKey[];
  halfCheckedKeys: VueKey[];
  keyEntities: KeyEntities;

  dragging: boolean;
  dragOverNodeKey: VueKey | null;
  dropPosition: number | undefined;

  // Virtual list
  height: number | undefined;
  itemHeight: number | undefined;
  virtual?: boolean;
  scrollWidth?: number;

  onKeydown?: (e: KeyboardEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onContextmenu?: (e: MouseEvent) => void;
  onScroll?: (e: UIEvent) => void;
  onActiveChange: (key: VueKey) => void;

  onListChangeStart: () => void;
  onListChangeEnd: () => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  data,
  // eslint-disable-next-line unused-imports/no-unused-vars, no-unused-vars
  selectable = undefined,
  // eslint-disable-next-line unused-imports/no-unused-vars, no-unused-vars
  checkable = undefined,
  expandedKeys,
  selectedKeys,
  checkedKeys,
  loadedKeys,
  loadingKeys,
  halfCheckedKeys,
  keyEntities,
  disabled,

  dragging,
  dragOverNodeKey,
  dropPosition,
  motion,

  height,
  itemHeight,
  virtual,
  scrollWidth,

  focusable,
  activeItem,
  focused,
  tabindex,

  onKeydown,
  onFocus,
  onBlur,
  onActiveChange,

  onListChangeStart,
  onListChangeEnd,

  ...domProps
} = defineProps<NodeListProps<any>>();

// =============================== Ref ================================
const listRef = ref<ListRef>(null);
const indentMeasurerRef = ref<HTMLDivElement>(null);
defineExpose({
  scrollTo: (scroll) => {
    listRef.value.scrollTo(scroll);
  },
  getIndentWidth: () => indentMeasurerRef.value.offsetWidth,
});

// ============================== Motion ==============================
const prevExpandedKeys = ref(expandedKeys);
const prevData = ref(data);
const transitionData = ref(data);
const transitionRange = ref([]);
const motionType = ref<'show' | 'hide' | null>(null);

// When motion end but data change, this will makes data back to previous one
const dataRef = ref(data);
watch(
  () => data,
  (val) => {
    dataRef.value = val;
  },
  { immediate: true, deep: true },
);

function onMotionEnd() {
  const latestData = dataRef.value;

  prevData.value = latestData;
  transitionData.value = latestData;
  transitionRange.value = [];
  motionType.value = null;

  onListChangeEnd();
}

const MotionNode: DataNode = {
  key: MOTION_KEY,
};

const MotionFlattenData: FlattenNode = {
  parent: null,
  children: [],
  pos: MotionEntity.pos,
  data: MotionNode,
  title: null,
  key: MOTION_KEY,
  /** Hold empty list here since we do not use it */
  isStart: [],
  isEnd: [],
};

// Do animation if expanded keys changed
// layoutEffect here to avoid blink of node removing
watch(
  () => [expandedKeys, data],
  async () => {
    nextTick(() => {
      prevExpandedKeys.value = expandedKeys;
    });
    const diffExpanded = findExpandedKeys(prevExpandedKeys.value, expandedKeys);
    if (diffExpanded.key !== null) {
      if (diffExpanded.add) {
        const keyIndex = prevData.value.findIndex(({ key }) => key === diffExpanded.key);

        const rangeNodes = getMinimumRangeTransitionRange(
          getExpandRange(prevData.value, data, diffExpanded.key),
          virtual,
          height,
          itemHeight,
        );

        const newTransitionData: FlattenNode[] = prevData.value.slice();
        newTransitionData.splice(keyIndex + 1, 0, MotionFlattenData);

        transitionData.value = newTransitionData;
        transitionRange.value = rangeNodes;
        motionType.value = 'show';
      } else {
        const keyIndex = data.findIndex(({ key }) => key === diffExpanded.key);

        const rangeNodes = getMinimumRangeTransitionRange(
          getExpandRange(data, prevData.value, diffExpanded.key),
          virtual,
          height,
          itemHeight,
        );

        const newTransitionData: FlattenNode[] = data.slice();
        newTransitionData.splice(keyIndex + 1, 0, MotionFlattenData);

        transitionData.value = newTransitionData;
        transitionRange.value = rangeNodes;
        motionType.value = 'hide';
      }
    } else if (!isEqual(toRaw(prevData.value), toRaw(data))) {
      // If whole data changed, we just refresh the list
      prevData.value = data;
      transitionData.value = data;
    }
  },
  { deep: true, flush: 'post' },
);

// We should clean up motion if is changed by dragging
watch(
  () => dragging,
  () => {
    if (!dragging) {
      onMotionEnd();
    }
  },
  { immediate: true },
);

const mergedData = computed(() => (motion ? transitionData.value : data));

const treeNodeRequiredProps = computed(() => {
  return {
    expandedKeys,
    selectedKeys,
    loadedKeys,
    loadingKeys,
    checkedKeys,
    halfCheckedKeys,
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  };
});

const HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0,
};

function getAccessibilityPath(item: FlattenNode): string {
  let path = String(item.data.key);
  let current = item;

  while (current.parent) {
    current = current.parent;
    path = `${String(current.data.key)} > ${path}`;
  }

  return path;
}
const noop = () => {};

function itemKey(item: FlattenNode) {
  const { key, pos } = item;
  return getKey(key, pos);
}

const ItemNode = (treeNode: FlattenNode) => {
  const {
    pos,
    data: { ...restProps },
    title,
    key,
    isStart,
    isEnd,
  } = treeNode;
  const mergedKey = getKey(key, pos);
  delete restProps.key;
  delete restProps.children;

  const treeNodeProps = getTreeNodeProps(mergedKey, treeNodeRequiredProps.value);
  return (
    <MotionTreeNode
      {...restProps}
      {...treeNodeProps}
      title={title}
      active={!!activeItem && key === activeItem.key}
      pos={pos}
      data={treeNode.data}
      isStart={isStart}
      isEnd={isEnd}
      motion={motion}
      motionNodes={key === MOTION_KEY ? transitionRange.value : null}
      motionType={motionType.value}
      onMotionStart={onListChangeStart}
      onMotionEnd={onMotionEnd}
      treeNodeRequiredProps={treeNodeRequiredProps.value}
      onMousemove={() => {
        onActiveChange(null);
      }}
    ></MotionTreeNode>
  );
};
</script>
<template>
  <span v-if="focused && activeItem" :style="HIDDEN_STYLE" aria-live="assertive">
    {{ getAccessibilityPath(activeItem) }}
  </span>
  <div>
    <input
      :style="HIDDEN_STYLE"
      :disabled="focusable === false || disabled"
      :tabindex="focusable !== false ? tabindex : null"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
      value=""
      @change="noop"
      aria-label="for screen reader"
    />
  </div>
  <div
    :class="`${prefixCls}-treenode`"
    aria-hidden
    :style="{
      position: 'absolute',
      pointerEvents: 'none',
      visibility: 'hidden',
      height: 0,
      overflow: 'hidden',
      border: 0,
      padding: 0,
    }"
  >
    <div :class="`${prefixCls}-indent`">
      <div ref="indentMeasurerRef" :class="`${prefixCls}-indent-unit`"></div>
    </div>
  </div>

  <VirtualList
    v-bind="domProps"
    :data="mergedData"
    :item-key="itemKey"
    :height="height"
    :full-height="false"
    :virtual="virtual"
    :item-height="itemHeight"
    :scroll-width="scrollWidth"
    :prefix-cls="`${prefixCls}-list`"
    ref="listRef"
    role="tree"
    @visible-change="
      (originList) => {
        // The best match is using `fullList` - `originList` = `restList`
        // and check the `restList` to see if has the MOTION_KEY node
        // but this will cause performance issue for long list compare
        // we just check `originList` and repeat trigger `onMotionEnd`
        if (originList.every((item) => itemKey(item) !== MOTION_KEY)) {
          onMotionEnd();
        }
      }
    "
  >
    <template #default="{ item }">
      <component :is="ItemNode(item)" />
    </template>
  </VirtualList>
</template>
