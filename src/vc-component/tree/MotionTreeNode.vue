<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import clsx from 'clsx';
import { computed, nextTick, ref, toRefs, watch } from 'vue';
import { useTreeContextInject } from './contextTypes';
import type { DataNode, FlattenNode, TreeNodeProps } from './interface';
import { useUnmount } from './useUnmount';
import { getTreeNodeProps, type TreeNodeRequiredProps } from './utils/treeUtil';
import TreeNode from './TreeNode.vue';
interface MotionTreeNodeProps extends Omit<TreeNodeProps, 'domRef'> {
  active: boolean;
  motion?: any;
  motionNodes?: FlattenNode[];
  onMotionStart: () => void;
  onMotionEnd: () => void;
  motionType?: 'show' | 'hide';

  treeNodeRequiredProps: TreeNodeRequiredProps;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  class: className,
  style,
  motion,
  motionNodes,
  motionType,
  onMotionStart: onOriginMotionStart,
  onMotionEnd: onOriginMotionEnd,
  active,
  treeNodeRequiredProps,
  selectable = undefined,
  ...props
} = defineProps<MotionTreeNodeProps>();

const visible = ref(true);
const { prefixCls } = toRefs(useTreeContextInject());

// Calculate target visible here.
// And apply in effect to make `leave` motion work.
const targetVisible = computed(() => motionNodes && motionType !== 'hide');

watch(
  () => motionNodes,
  () => {
    nextTick(() => {
      if (motionNodes) {
        if (targetVisible.value !== visible.value) {
          visible.value = targetVisible.value;
        }
      }
    });
  },
  { immediate: true, deep: true },
);

const triggerMotionStart = () => {
  if (motionNodes) {
    onOriginMotionStart();
  }
};

// Should only trigger once
const triggerMotionEndRef = ref(false);
const triggerMotionEnd = () => {
  if (motionNodes && !triggerMotionEndRef.value) {
    triggerMotionEndRef.value = true;
    onOriginMotionEnd();
  }
};

// Effect if unmount
useUnmount(triggerMotionStart, triggerMotionEnd);

// Motion end event
const onVisibleChanged = (nextVisible: boolean) => {
  if (targetVisible.value === nextVisible) {
    triggerMotionEnd();
  }
};

const ItemNode = (treeNode: FlattenNode<DataNode>) => {
  const {
    data: { ...restProps },
    title,
    key,
    isStart,
    isEnd,
  } = treeNode;
  delete restProps.children;

  const treeNodeProps = getTreeNodeProps(key, treeNodeRequiredProps);

  return (
    <TreeNode
      {...restProps}
      {...treeNodeProps}
      title={title}
      active={active}
      data={treeNode.data}
      key={key}
      isStart={isStart}
      isEnd={isEnd}
    ></TreeNode>
  );
};

const domRef = ref(null);
</script>
<template>
  <template v-if="motionNodes">
    <CSSMotion
      ref="domRef"
      :visible="visible"
      v-bind="motion"
      :motion-appear="motionType === 'show'"
      @visible-changed="onVisibleChanged"
    >
      <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
        <div :ref="motionRef" :class="clsx(`${prefixCls}-treenode-motion`, motionClassName)" :style="motionStyle">
          <template v-for="treeNode in motionNodes" :key="treeNode.key">
            <component :is="ItemNode(treeNode)" />
          </template>
        </div>
      </template>
    </CSSMotion>
  </template>

  <template v-else>
    <TreeNode ref="domRef" :class="className" :style="style" v-bind="props" :active="active" :selectable="selectable" />
  </template>
</template>
