<script lang="tsx" setup>
import { computed, getCurrentInstance, ref, toRaw, toRefs, watch } from 'vue';
import { useTreeContextInject, useUnstableContextInject } from './contextTypes';
import type { DataEntity, TreeNodeProps } from './interface';
import getEntity from './utils/keyUtil';
import { convertNodePropsToEventData } from './utils/treeUtil';
import Render from '@/vc-component/render';
import clsx from 'clsx';
import pickAttrs from '@/vc-util/pickAttrs';
import { reactiveComputed } from '@vueuse/core';
import Indent from './Indent.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  eventKey,
  class: className,
  style,
  dragOver,
  dragOverGapTop,
  dragOverGapBottom,
  isLeaf,
  isStart,
  isEnd,
  expanded,
  selected,
  checked,
  halfChecked,
  loading,
  domRef,
  active,
  data,
  onMousemove,
  selectable,
  ...otherProps
} = defineProps<TreeNodeProps>();

const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';

const defaultTitle = '---';

const context = useTreeContextInject();

const { classNames: treeClassNames, styles } = toRefs(context);

const unstableContext = useUnstableContextInject();

const selectHandleRef = ref<HTMLSpanElement>(null);

const dragNodeHighlight = ref<boolean>(false);

// ======= State: Disabled State =======
const isDisabled = computed(() => {
  return !!(context.disabled || otherProps.disabled || unstableContext.nodeDisabled?.(data));
});

const isCheckable = computed(() => {
  // Return false if tree or treeNode is not checkable
  if (!context.checkable) {
    return false;
  }
  return context.checkable;
});

const vm = getCurrentInstance();
// ======= Event Handlers: Selection and Check =======
const onSelect = (e: MouseEvent) => {
  if (isDisabled.value) {
    return;
  }
  context.onNodeSelect(e, convertNodePropsToEventData(vm.props));
};

const onCheck = (e: MouseEvent) => {
  if (isDisabled.value) {
    return;
  }
  if (!isCheckable.value || vm.props.disableCheckbox) {
    return;
  }
  context.onNodeCheck(e, convertNodePropsToEventData(vm.props), !checked);
};

// ======= State: Selectable Check =======
const isSelectable = computed<boolean>(() => {
  // Ignore when selectable is undefined or null
  if (typeof selectable === 'boolean') {
    return selectable;
  }
  return context.selectable;
});

const onSelectorClick = (e: MouseEvent) => {
  // Click trigger before select/check operation
  context.onNodeClick(e, convertNodePropsToEventData(vm.props));
  if (isSelectable.value) {
    onSelect(e);
  } else {
    onCheck(e);
  }
};

const onSelectorDoubleClick = (e: MouseEvent) => {
  context.onNodeDoubleClick(e, convertNodePropsToEventData(vm.props));
};

const onMouseEnter = (e: MouseEvent) => {
  context.onNodeMouseEnter(e, convertNodePropsToEventData(vm.props));
};

const onMouseLeave = (e: MouseEvent) => {
  context.onNodeMouseLeave(e, convertNodePropsToEventData(vm.props));
};

const onContextMenu = (e: MouseEvent) => {
  context.onNodeContextMenu(e, convertNodePropsToEventData(vm.props));
};

// ======= Drag: Drag Enabled =======
const isDraggable = computed<boolean>(() => {
  return !!(context.draggable && (!context.draggable.nodeDraggable || context.draggable.nodeDraggable(data)));
});

// ======= Drag: Drag Event Handlers =======
const onDragStart = (e: DragEvent) => {
  e.stopPropagation();
  dragNodeHighlight.value = true;
  context.onNodeDragStart(e, vm.props);
  try {
    // ie throw error
    // firefox-need-it
    e.dataTransfer.setData('text/plain', '');
  } catch {
    // empty
  }
};

const onDragEnter = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  context.onNodeDragEnter(e, vm.props);
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  context.onNodeDragOver(e, vm.props);
};

const onDragLeave = (e: DragEvent) => {
  e.stopPropagation();
  context.onNodeDragLeave(e, vm.props);
};

const onDragEnd = (e: DragEvent) => {
  e.stopPropagation();
  dragNodeHighlight.value = false;
  context.onNodeDragEnd(e, vm.props);
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  dragNodeHighlight.value = false;
  context.onNodeDrop(e, vm.props);
};

// ======= Expand: Node Expansion =======
const onExpand = (e: MouseEvent) => {
  if (loading) {
    return;
  }
  context.onNodeExpand(e, convertNodePropsToEventData(vm.props));
};

// ======= State: Has Children =======
const hasChildren = computed<boolean>(() => {
  const { children } = getEntity(context.keyEntities, eventKey) || {};
  return Boolean((children || []).length);
});

// ======= State: Leaf Check =======
const memoizedIsLeaf = computed<boolean>(() => {
  if (!isLeaf) {
    return isLeaf || (!context.loadData && !hasChildren.value) || (context.loadData && vm.props.loaded && !hasChildren.value);
  }
  return isLeaf;
});

// ============== Effect ==============
watch(
  [() => loading, () => context.loadData, () => context.onNodeLoad, () => expanded, () => memoizedIsLeaf.value, () => vm.props],
  () => {
    // Load data to avoid default expanded tree without data
    if (loading) {
      return;
    }
    // read from state to avoid loadData at same time
    if (typeof context.loadData === 'function' && expanded && !memoizedIsLeaf.value && !vm.props.loaded) {
      // We needn't reload data when has children in sync logic
      // It's only needed in node expanded
      context.onNodeLoad(convertNodePropsToEventData(vm.props));
    }
  },
  { immediate: true, deep: true },
);

// ==================== Render: Drag Handler ====================
const dragHandlerNode = () => {
  if (!context.draggable?.icon) {
    return null;
  }
  return (
    <span class={`${context.prefixCls}-draggable-icon`}>
      <Render content={context.draggable.icon}></Render>
    </span>
  );
};

// ====================== Render: Switcher ======================
const renderSwitcherIconDom = (isInternalLeaf: boolean) => {
  const switcherIcon = vm.props.switcherIcon || context.switcherIcon;
  // if switcherIconDom is null, no render switcher span
  if (typeof switcherIcon === 'function') {
    return switcherIcon({ ...vm.props, isLeaf: isInternalLeaf });
  }
  return switcherIcon;
};

// Switcher
const renderSwitcher = () => {
  if (memoizedIsLeaf.value) {
    // if switcherIconDom is null, no render switcher span
    const switcherIconDom = renderSwitcherIconDom(true);
    return switcherIconDom !== false ? (
      <span class={clsx(`${context.prefixCls}-switcher`, `${context.prefixCls}-switcher-noop`)}>
        <Render content={switcherIconDom}></Render>
      </span>
    ) : null;
  }
  const switcherIconDom = renderSwitcherIconDom(false);
  return switcherIconDom !== false ? (
    <span
      onClick={onExpand}
      class={clsx(`${context.prefixCls}-switcher`, `${context.prefixCls}-switcher_${expanded ? ICON_OPEN : ICON_CLOSE}`)}
    >
      <Render content={switcherIconDom}></Render>
    </span>
  ) : null;
};

// ====================== Checkbox ======================
const checkboxNode = () => {
  if (!isCheckable.value) {
    return null;
  }

  // [Legacy] Custom element should be separate with `checkable` in future
  const $custom = typeof isCheckable.value !== 'boolean' ? isCheckable.value : null;

  return (
    <span
      class={clsx(`${context.prefixCls}-checkbox`, {
        [`${context.prefixCls}-checkbox-checked`]: checked,
        [`${context.prefixCls}-checkbox-indeterminate`]: !checked && halfChecked,
        [`${context.prefixCls}-checkbox-disabled`]: isDisabled.value || vm.props.disableCheckbox,
      })}
      onClick={onCheck}
      role="checkbox"
      aria-checked={halfChecked ? 'mixed' : checked}
      aria-disabled={isDisabled.value || (vm.props.disableCheckbox as boolean)}
      aria-label={`Select ${typeof vm.props.title === 'string' ? vm.props.title : 'tree node'}`}
    >
      <Render content={$custom}></Render>
    </span>
  );
};

// ============== State: Node State (Open/Close) ==============
const nodeState = computed<typeof ICON_OPEN | typeof ICON_CLOSE>(() => {
  if (memoizedIsLeaf.value) {
    return null;
  }
  return expanded ? ICON_OPEN : ICON_CLOSE;
});

// ==================== Render: Title + Icon ====================
const iconNode = () => {
  return (
    <span
      class={clsx(
        treeClassNames.value?.itemIcon,
        `${context.prefixCls}-iconEle`,
        `${context.prefixCls}-icon__${nodeState.value || 'docu'}`,
        {
          [`${context.prefixCls}-icon_loading`]: loading,
        },
      )}
      style={styles.value?.itemIcon}
    />
  );
};

// =================== Drop Indicator ===================
const dropIndicatorNode = () => {
  const rootDraggable = Boolean(context.draggable);
  // allowDrop is calculated in Tree.tsx, there is no need for calc it here
  const showIndicator = !vm.props.disabled && rootDraggable && context.dragOverNodeKey === eventKey;
  if (!showIndicator) {
    return null;
  }
  return (
    <Render
      content={toRaw(context.dropIndicatorRender)}
      {...{
        dropPosition: context.dropPosition,
        dropLevelOffset: context.dropLevelOffset,
        indent: context.indent,
        prefixCls: context.prefixCls,
        direction: context.direction,
      }}
    ></Render>
  );
};

// Icon + Title
const selectorNode = () => {
  const { title = defaultTitle } = vm.props;

  const wrapClass = `${context.prefixCls}-node-content-wrapper`;

  // Icon - Still show loading icon when loading without showIcon
  let $icon: any;

  if (context.showIcon) {
    const currentIcon = vm.props.icon || context.icon;

    $icon = currentIcon ? (
      <span
        class={clsx(treeClassNames.value?.itemIcon, `${context.prefixCls}-iconEle`, `${context.prefixCls}-icon__customize`)}
        style={styles.value?.itemIcon}
      >
        {typeof currentIcon === 'function' ? currentIcon(vm.props) : currentIcon}
      </span>
    ) : (
      iconNode
    );
  } else if (context.loadData && loading) {
    $icon = iconNode;
  }

  // Title
  let titleNode: any;
  if (typeof title === 'function') {
    titleNode = title(data);
  } else if (context.titleRender) {
    titleNode = context.titleRender(data);
  } else {
    titleNode = title;
  }

  return (
    <span
      ref={selectHandleRef}
      title={typeof title === 'string' ? title : ''}
      class={clsx(wrapClass, `${wrapClass}-${nodeState.value || 'normal'}`, {
        [`${context.prefixCls}-node-selected`]: !isDisabled.value && (selected || dragNodeHighlight.value),
      })}
      onMouseenter={onMouseEnter}
      onMouseleave={onMouseLeave}
      onContextmenu={onContextMenu}
      onClick={onSelectorClick}
      onDblclick={onSelectorDoubleClick}
    >
      <Render content={$icon}></Render>
      <span class={clsx(`${context.prefixCls}-title`, treeClassNames.value?.itemTitle)} style={styles.value?.itemTitle}>
        <Render content={titleNode}></Render>
      </span>
      <Render content={dropIndicatorNode}></Render>
    </span>
  );
};

const dataOrAriaAttributeProps = computed(() => pickAttrs(otherProps, { aria: true, data: true }));

const { level } = toRefs(reactiveComputed(() => getEntity(context.keyEntities, eventKey) || ({} as DataEntity)));

const isEndNode = computed(() => isEnd[isEnd.length - 1]);

const draggableWithoutDisabled = computed(() => !isDisabled.value && isDraggable.value);

const dragging = computed(() => context.draggingNodeKey === eventKey);
const ariaSelected = computed(() => (selectable !== undefined ? { 'aria-selected': !!selectable } : undefined));
</script>
<template>
  <div
    ref="domRef"
    role="treeitem"
    :aria-expanded="isLeaf ? undefined : expanded"
    :class="
      clsx(className, `${context.prefixCls}-treenode`, treeClassNames?.item, {
        [`${context.prefixCls}-treenode-disabled`]: isDisabled,
        [`${context.prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
        [`${context.prefixCls}-treenode-checkbox-checked`]: checked,
        [`${context.prefixCls}-treenode-checkbox-indeterminate`]: halfChecked,
        [`${context.prefixCls}-treenode-selected`]: selected,
        [`${context.prefixCls}-treenode-loading`]: loading,
        [`${context.prefixCls}-treenode-active`]: active,
        [`${context.prefixCls}-treenode-leaf-last`]: isEndNode,
        [`${context.prefixCls}-treenode-draggable`]: isDraggable,
        dragging,
        'drop-target': context.dropTargetKey === eventKey,
        'drop-container': context.dropContainerKey === eventKey,
        'drag-over': !isDisabled && dragOver,
        'drag-over-gap-top': !isDisabled && dragOverGapTop,
        'drag-over-gap-bottom': !isDisabled && dragOverGapBottom,
        'filter-node': context.filterTreeNode?.(convertNodePropsToEventData($props)),
        [`${context.prefixCls}-treenode-leaf`]: memoizedIsLeaf,
      })
    "
    :style="{ ...style, ...styles?.item }"
    :draggable="draggableWithoutDisabled"
    @dragstart="(e) => (draggableWithoutDisabled ? onDragStart(e) : undefined)"
    @dragenter="(e) => (isDraggable ? onDragEnter(e) : undefined)"
    @dragover="(e) => (isDraggable ? onDragOver(e) : undefined)"
    @dragleave="(e) => (isDraggable ? onDragLeave(e) : undefined)"
    @drop="(e) => (isDraggable ? onDrop(e) : undefined)"
    @dragend="(e) => (isDraggable ? onDragEnd(e) : undefined)"
    @mousemove="onMousemove"
    v-bind="{ ...ariaSelected, ...dataOrAriaAttributeProps }"
  >
    <Indent :prefix-cls="context.prefixCls" :level="level" :is-start="isStart" :is-end="isEnd" />
    <Render :content="dragHandlerNode" />
    <Render :content="renderSwitcher" />
    <Render :content="checkboxNode" />
    <Render :content="selectorNode" />
  </div>
</template>
