<script lang="tsx" setup>
import { computed, type CSSProperties } from 'vue';
import Step from './Step.vue';
import { StepsContextProvider, type StepsContextProps } from './Context';
import type StepIcon from './StepIcon.vue';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';

export type Status = 'error' | 'process' | 'finish' | 'wait';

export type SemanticName =
  | 'root'
  | 'item'
  | 'itemWrapper'
  | 'itemHeader'
  | 'itemTitle'
  | 'itemSubtitle'
  | 'itemSection'
  | 'itemContent'
  | 'itemIcon'
  | 'itemRail';

export type ItemSemanticName = 'root' | 'wrapper' | 'header' | 'title' | 'subtitle' | 'section' | 'content' | 'icon' | 'rail';

export type StepItem = {
  content?: any;
  disabled?: boolean;
  icon?: any;
  status?: Status;
  subTitle?: any;
  title?: any;
  classNames?: Partial<Record<ItemSemanticName, string>>;
  styles?: Partial<Record<ItemSemanticName, CSSProperties>>;
  class?: string;
  style?: CSSProperties;
  onClick?: (e: Event) => void;
};

export type StepIconRender = (info: {
  index: number;
  status: Status;
  title: VueNode;
  content: VueNode;
  node: VueNode;
}) => VueNode;

export type RenderInfo = {
  index: number;
  active: boolean;
  item: StepItem;
};

export interface StepsProps {
  // style
  prefixCls?: string;
  style?: CSSProperties;
  class?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  rootClassName?: string;

  // layout
  orientation?: 'horizontal' | 'vertical';
  titlePlacement?: 'horizontal' | 'vertical';

  // a11y
  /** Internal usage of antd. Do not deps on this. */
  components?: {
    root?: VueNode;
    item?: VueNode;
  };

  // data
  status?: Status;
  current?: number;
  initial?: number;
  items?: StepItem[];
  onChange?: (current: number) => void;

  // render
  iconRender?: (
    originNode: VueNode,
    info: RenderInfo & {
      components: {
        Icon: typeof StepIcon;
      };
    },
  ) => any;
  itemRender?: (originNode: VueNode, VueNode: RenderInfo) => VueNode;
  itemWrapperRender?: (originNode: VueNode) => VueNode;
}

const {
  // style
  prefixCls = 'rc-steps',
  style,
  class: className,
  classNames = {},
  styles = {},
  rootClassName,

  // layout
  orientation,
  titlePlacement,
  components,

  // data
  status = 'process',
  current = 0,
  initial = 0,
  onChange,
  items,

  // render
  iconRender,
  itemRender,
  itemWrapperRender,

  ...restProps
} = defineProps<StepsProps>();

// ============================= layout =============================
const isVertical = computed(() => orientation === 'vertical');
const mergedOrientation = computed(() => (isVertical.value ? 'vertical' : 'horizontal'));
const mergeTitlePlacement = computed(() => (!isVertical.value && titlePlacement === 'vertical' ? 'vertical' : 'horizontal'));

// ============================= styles =============================
const classString = computed(() => {
  return clsx(
    prefixCls,
    `${prefixCls}-${mergedOrientation.value}`,
    `${prefixCls}-title-${mergeTitlePlacement.value}`,
    rootClassName,
    className,
    classNames.root,
  );
});

// ============================== Data ==============================
const mergedItems = computed(() => (items || []).filter(Boolean));
const statuses = computed(() =>
  mergedItems.value.map(({ status: itemStatus }, index) => {
    const stepNumber = initial + index;

    if (!itemStatus) {
      if (stepNumber === current) {
        return status;
      } else if (stepNumber < current) {
        return 'finish';
      }
      return 'wait';
    }

    return itemStatus;
  }),
);

// ============================= events =============================
const onStepClick = (next: number) => {
  if (onChange && current !== next) {
    onChange(next);
  }
};

// =========================== components ===========================
const RootComponent = computed(() => components?.root || 'div');
const ItemComponent = computed(() => components?.item || 'div');

// ============================ contexts ============================
const stepIconContext = computed<StepsContextProps>(() => ({
  prefixCls,
  classNames,
  styles,
  ItemComponent: ItemComponent.value,
}));

// ============================= render =============================
const renderStep = (item: StepItem, index: number) => {
  const stepIndex = initial + index;

  const itemStatus = statuses.value[index];
  const nextStatus = statuses.value[index + 1];

  const data = {
    ...item,
    status: itemStatus,
  };
  return (
    <Step
      key={stepIndex}
      // Style
      prefixCls={prefixCls}
      classNames={classNames}
      styles={styles}
      // Data
      data={data}
      nextStatus={nextStatus}
      active={stepIndex === current}
      index={stepIndex}
      last={mergedItems.value.length - 1 === index}
      // Render
      iconRender={iconRender}
      itemRender={itemRender}
      itemWrapperRender={itemWrapperRender}
      onClick={onChange && onStepClick}
    />
  );
};
</script>
<template>
  <component
    :is="RootComponent"
    :class="classString"
    :style="{
      ...style,
      ...styles?.root,
    }"
    v-bind="restProps"
  >
    <StepsContextProvider :value="stepIconContext">
      <template v-for="(item, index) in mergedItems" :key="index">
        <Render :content="renderStep(item, index)" />
      </template>
    </StepsContextProvider>
  </component>
</template>
