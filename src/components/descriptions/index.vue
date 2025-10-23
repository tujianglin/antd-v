<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueKey, VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties, type VNode } from 'vue';
import type { Breakpoint } from '../_util/responsiveObserver';
import { matchScreen } from '../_util/responsiveObserver';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import DEFAULT_COLUMN_MAP from './constant';
import { DescriptionsContextProvider } from './DescriptionsContext';
import useItems from './hooks/useItems';
import useRow from './hooks/useRow';
import type { DescriptionsItemProps } from './Item';
import Row from './Row.vue';
import useStyle from './style';

export interface InternalDescriptionsItemType extends Omit<DescriptionsItemProps, 'span'> {
  key?: VueKey;
  filled?: boolean;
  span?: number;
}

export interface DescriptionsItemType extends Omit<DescriptionsItemProps, 'prefixCls'> {
  key?: VueKey;
}

type SemanticName = 'root' | 'header' | 'title' | 'extra' | 'label' | 'content';

export interface DescriptionsProps {
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  bordered?: boolean;
  size?: 'middle' | 'small' | 'default';
  title?: VueNode;
  extra?: VueNode;
  column?: number | Partial<Record<Breakpoint, number>>;
  layout?: 'horizontal' | 'vertical';
  colon?: boolean;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  classNames?: Partial<Record<SemanticName, string>>;
  items?: DescriptionsItemType[];
  id?: string;
}

defineOptions({ name: 'Descriptions', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  title: customTitle,
  extra: extraTitle,
  column,
  colon = true,
  bordered,
  layout,
  class: className,
  rootClassName,
  style,
  size: customizeSize,
  styles,
  items,
  classNames: descriptionsClassNames,
  ...restProps
} = defineProps<DescriptionsProps>();

const slots = defineSlots<{
  title?: () => VNode[];
  extra?: () => VNode[];
}>();

const title = computed(() => slots.title || customTitle);
const extra = computed(() => slots.extra || extraTitle);

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('descriptions'));
const prefixCls = computed(() => getPrefixCls.value('descriptions', customizePrefixCls));
const screens = useBreakpoint();

// Column count
const mergedColumn = computed(() => {
  if (typeof column === 'number') {
    return column;
  }

  return (
    matchScreen(screens.value, {
      ...DEFAULT_COLUMN_MAP,
      ...column,
    }) ?? 3
  );
});

// Items with responsive
const mergedItems = useItems(
  screens,
  computed(() => items),
);

const mergedSize = useSize(computed(() => customizeSize));
const rows = useRow(mergedColumn, mergedItems);

const [hashId, cssVarCls] = useStyle(prefixCls);

// ======================== Render ========================
const contextValue = computed(() => ({
  styles: {
    content: { ...contextStyles?.value?.content, ...styles?.content },
    label: { ...contextStyles?.value?.label, ...styles?.label },
  },
  classNames: {
    label: clsx(contextClassNames?.value?.label, descriptionsClassNames?.label),
    content: clsx(contextClassNames?.value?.content, descriptionsClassNames?.content),
  },
}));
</script>
<template>
  <DescriptionsContextProvider :value="contextValue">
    <div
      v-bind="restProps"
      :class="
        clsx(
          prefixCls,
          contextClassName,
          contextClassNames.root,
          descriptionsClassNames?.root,
          {
            [`${prefixCls}-${mergedSize}`]: mergedSize && mergedSize !== 'default',
            [`${prefixCls}-bordered`]: !!bordered,
            [`${prefixCls}-rtl`]: direction === 'rtl',
          },
          className,
          rootClassName,
          hashId,
          cssVarCls,
        )
      "
      :style="{
        ...contextStyle,
        ...contextStyles.root,
        ...styles?.root,
        ...style,
      }"
    >
      <div
        v-if="title || extra"
        :class="clsx(`${prefixCls}-header`, contextClassNames.header, descriptionsClassNames?.header)"
        :style="{ ...contextStyles.header, ...styles?.header }"
      >
        <div
          v-if="title"
          :class="clsx(`${prefixCls}-title`, contextClassNames.title, descriptionsClassNames?.title)"
          :style="{
            ...contextStyles.title,
            ...styles?.title,
          }"
        >
          <Render :content="title" />
        </div>
        <div
          v-if="extra"
          :class="clsx(`${prefixCls}-extra`, contextClassNames.extra, descriptionsClassNames?.extra)"
          :style="{
            ...contextStyles.extra,
            ...styles?.extra,
          }"
        >
          <Render :content="extra" />
        </div>
      </div>
      <div :class="`${prefixCls}-view`">
        <table>
          <tbody>
            <Row
              v-for="(row, index) in rows"
              :key="index"
              :index="index"
              :colon="colon"
              :prefix-cls="prefixCls"
              :vertical="layout === 'vertical'"
              :bordered="bordered"
              :row="row"
            />
          </tbody>
        </table>
      </div>
    </div>
  </DescriptionsContextProvider>
</template>
