<script lang="tsx" setup>
import { UnstableContextProvider } from '@/vc-component/steps/UnstableContext';
import type { VueKey, VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties, type VNode } from 'vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import type { LiteralUnion } from '../_util/type';
import { useComponentConfig } from '../config-provider/context';
import type { StepsProps } from '../steps';
import Steps from '../steps';
import { InternalContextProvider } from '../steps/context';
import useStyle from './style';
import useItems from './useItems';

export type ItemPosition = 'left' | 'right' | 'start' | 'end';
export type ItemPlacement = 'start' | 'end';

export type TimelineMode = ItemPosition | 'alternate';

type Color = 'blue' | 'red' | 'green' | 'gray';

export interface TimelineItemType {
  // Style
  color?: LiteralUnion<Color>;
  class?: string;
  style?: CSSProperties;
  classNames?: StepsProps['items'][number]['classNames'];
  styles?: StepsProps['items'][number]['styles'];

  // Design
  placement?: ItemPlacement;
  loading?: boolean;

  // Data
  key?: VueKey;
  title?: VueNode;
  content?: VueNode;

  // Icon
  icon?: VueNode;
}

export interface TimelineProps {
  // Style
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  classNames?: StepsProps['classNames'];
  styles?: StepsProps['styles'];
  rootClassName?: string;

  // Design
  variant?: StepsProps['variant'];
  mode?: TimelineMode;
  orientation?: 'horizontal' | 'vertical';
  titleSpan?: string | number;

  // Data
  items?: TimelineItemType[];

  reverse?: boolean;
}

defineOptions({ name: 'Timeline', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,

  // Style
  class: className,
  style,
  classNames,
  styles,

  // Design
  variant = 'outlined',
  mode,
  orientation = 'vertical',
  titleSpan,

  // Data
  items,
  reverse,

  ...restProps
} = defineProps<TimelineProps>();

const slots = defineSlots<{ default: () => VNode[] }>();

const stepInternalContext = {
  rootComponent: 'ol',
  itemComponent: 'li',
};

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('timeline'));

// ===================== MISC =======================
const prefixCls = computed(() => getPrefixCls.value('timeline', customizePrefixCls));

// ==================== Styles ======================
// This will be duplicated with Steps's hashId & cssVarCls when they have same token
// But this is safe to keep here since web will do nothing
const [hashId, cssVarCls] = useStyle(prefixCls);

const stepsClassNames = computed(() => ({
  item: `${prefixCls.value}-item`,
  itemTitle: `${prefixCls.value}-item-title`,
  itemIcon: `${prefixCls.value}-item-icon`,
  itemContent: `${prefixCls.value}-item-content`,
  itemRail: `${prefixCls.value}-item-rail`,
  itemWrapper: `${prefixCls.value}-item-wrapper`,
  itemSection: `${prefixCls.value}-item-section`,
  itemHeader: `${prefixCls.value}-item-header`,
}));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [stepsClassNames.value, contextClassNames?.value, classNames]),
  computed(() => [contextStyles?.value, styles]),
);

// ===================== Mode =======================
const mergedMode = computed(() => {
  // Deprecated
  if (mode === 'left') {
    return 'start';
  }

  if (mode === 'right') {
    return 'end';
  }

  // Fill
  const modeList: (string | undefined)[] = ['alternate', 'start', 'end'];
  return (modeList.includes(mode) ? mode : 'start') as TimelineMode;
});

// ===================== Data =======================
const rawItems = useItems(
  prefixCls,
  mergedMode,
  computed(() => items),
  slots.default?.(),
);

const mergedItems = computed(() => (reverse ? [...rawItems.value].reverse() : rawItems.value));

const stepContext = computed(() => ({
  railFollowPrevStatus: reverse,
}));

// ==================== Design ======================
const layoutAlternate = computed(
  () => mergedMode.value === 'alternate' || (orientation === 'vertical' && mergedItems.value.some((item) => item.title)),
);

// ==================== Render ======================
const stepStyle = computed<CSSProperties>(() => {
  const result = {
    ...contextStyle?.value,
    ...style,
  };
  if (titleSpan && mergedMode.value !== 'alternate') {
    if (typeof titleSpan === 'number') {
      result['--timeline-head-span'] = titleSpan;
    } else {
      result['--timeline-head-span-ptg'] = titleSpan;
    }
  }
  return result;
});
</script>
<template>
  <InternalContextProvider :value="stepInternalContext">
    <UnstableContextProvider :value="stepContext">
      <Steps
        v-bind="restProps"
        :class="
          clsx(prefixCls, contextClassName, className, hashId, cssVarCls, {
            [`${prefixCls}-${orientation}`]: orientation === 'horizontal',
            [`${prefixCls}-layout-alternate`]: layoutAlternate,
            [`${prefixCls}-rtl`]: direction === 'rtl',
          })
        "
        :style="stepStyle"
        :class-names="mergedClassNames"
        :styles="mergedStyles"
        :variant="variant"
        :orientation="orientation"
        type="dot"
        :items="mergedItems"
        :current="mergedItems.length - 1"
      />
    </UnstableContextProvider>
  </InternalContextProvider>
</template>
