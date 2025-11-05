<script lang="tsx" setup>
import { isValidElement } from '@/vc-util/Children/util';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties, type TdHTMLAttributes, type VNode } from 'vue';
import { useTableContextInject } from '../context/TableContext';
import type {
  AlignType,
  CellEllipsisType,
  ColumnType,
  CustomizeComponent,
  DataIndex,
  DefaultRecordType,
  ScopeType,
} from '../interface';
import useCellRender from './useCellRender';
import useHoverState from './useHoverState';
import Render from '@/vc-component/render';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';

export interface CellProps<RecordType extends DefaultRecordType> {
  prefixCls?: string;
  class?: string;
  style?: CSSProperties;
  record?: RecordType;
  /** `column` index is the real show rowIndex */
  index?: number;
  /** the index of the record. For the render(value, record, renderIndex) */
  renderIndex?: number;
  dataIndex?: DataIndex<RecordType>;
  render?: ColumnType<RecordType>['render'];
  component?: CustomizeComponent;
  children?: VueNode;
  colspan?: number;
  rowspan?: number;
  scope?: ScopeType;
  ellipsis?: CellEllipsisType;
  align?: AlignType;

  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean;

  // Fixed
  fixStart?: number | false;
  fixEnd?: number | false;
  fixedStartShadow?: boolean;
  fixedEndShadow?: boolean;
  offsetFixedStartShadow?: number;
  offsetFixedEndShadow?: number;
  zIndex?: number;
  zIndexReverse?: number;
  allColsFixedLeft?: boolean;

  // ====================== Private Props ======================
  /** @private Used for `expandable` with nest tree */
  appendNode?: VNode;
  additionalProps?: TdHTMLAttributes;

  rowType?: 'header' | 'body' | 'footer';

  isSticky?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  component: Component,
  children: customChildren,
  ellipsis,
  scope,

  // Style
  prefixCls,
  class: className,
  style,
  align,

  // Value
  record,
  render,
  dataIndex,
  renderIndex,

  // Row
  index,
  rowType,

  // Span
  colspan,
  rowspan,

  // Fixed
  fixStart,
  fixEnd,
  fixedStartShadow,
  fixedEndShadow,
  offsetFixedStartShadow,
  offsetFixedEndShadow,
  zIndex,
  zIndexReverse,

  // Private
  appendNode,
  additionalProps = {},
  isSticky,
} = defineProps<CellProps<any>>();

const slots = defineSlots<{
  default: () => VNode[];
}>();

const children = computed(() => {
  let child: any = flattenChildren(slots.default?.())[0];
  if (typeof child?.children === 'string') {
    child = child.children;
  }
  return child || customChildren;
});

const getTitleFromCellRenderChildren = ({
  ellipsis,
  rowType,
  children,
}: Pick<CellProps<any>, 'ellipsis' | 'rowType'> & { children: any }) => {
  let title: string;
  const ellipsisConfig: CellEllipsisType = ellipsis === true ? { showTitle: true } : ellipsis;
  if (ellipsisConfig && (ellipsisConfig.showTitle || rowType === 'header')) {
    if (typeof children === 'string' || typeof children === 'number') {
      title = children.toString();
    } else if (isValidElement(children) && typeof (children.props as any)?.children === 'string') {
      title = (children.props as any)?.children;
    }
  }
  return title;
};

const cellPrefixCls = computed(() => `${prefixCls}-cell`);

const { allColumnsFixedLeft, rowHoverable, scrollInfo } = toRefs(useTableContextInject());

// ====================== Value =======================
const [childNode, legacyCellProps] = useCellRender(
  computed(() => record),
  computed(() => dataIndex),
  computed(() => renderIndex),
  children,
  render,
);

// ====================== Fixed =======================
const isFixStart = computed(() => typeof fixStart === 'number' && !allColumnsFixedLeft.value);
const isFixEnd = computed(() => typeof fixEnd === 'number' && !allColumnsFixedLeft.value);

const showFixStartShadow = computed(() => {
  if (!isFixStart.value && !isFixEnd.value) {
    return false;
  }

  const [absScroll] = scrollInfo.value;

  return (
    (isFixStart.value && fixedStartShadow && absScroll) -
      // For precision, we not show shadow by default which has better user experience.
      (offsetFixedStartShadow as number) >=
    1
  );
});

const showFixEndShadow = computed(() => {
  if (!isFixStart.value && !isFixEnd.value) {
    return false;
  }

  const [absScroll, scrollWidth] = scrollInfo.value;

  return (
    (isFixEnd.value && fixedEndShadow && scrollWidth - absScroll) -
      // Same as above
      (offsetFixedEndShadow as number) >=
    1
  );
});
const fixedStyle = computed(() => {
  const result: CSSProperties = {};
  if (isFixStart.value) {
    result.insetInlineStart = `${fixStart as number}px`;
    result['--z-offset'] = zIndex;
    result['--z-offset-reverse'] = zIndexReverse;
  }
  if (isFixEnd.value) {
    result.insetInlineEnd = `${fixEnd as number}px`;
    result['--z-offset'] = zIndex;
    result['--z-offset-reverse'] = zIndexReverse;
  }
  return result;
});

// ================ RowSpan & ColSpan =================
const mergedColSpan = computed(() => legacyCellProps.value?.colspan ?? (additionalProps.colspan as number) ?? colspan ?? 1);
const mergedRowSpan = computed(() => legacyCellProps.value?.rowspan ?? (additionalProps.rowspan as number) ?? rowspan ?? 1);

// ====================== Hover =======================
const [hovering, onHover] = useHoverState(
  computed(() => index),
  mergedRowSpan,
);

const onMouseenter = (event) => {
  if (record) {
    onHover.value(index, index + mergedRowSpan.value - 1);
  }

  additionalProps?.onMouseenter?.(event);
};

const onMouseleave = (event) => {
  if (record) {
    onHover.value(-1, -1);
  }

  additionalProps?.onMouseleave?.(event);
};

// ====================== Render ======================

// >>>>> Title
const title = computed(
  () =>
    additionalProps.title ??
    getTitleFromCellRenderChildren({
      rowType,
      ellipsis,
      children: childNode.value,
    }),
);

// >>>>> ClassName
const mergedClassName = computed(() =>
  clsx(
    cellPrefixCls.value,
    className,
    {
      // Fixed
      [`${cellPrefixCls.value}-fix`]: isFixStart.value || isFixEnd.value,
      [`${cellPrefixCls.value}-fix-start`]: isFixStart.value,
      [`${cellPrefixCls.value}-fix-end`]: isFixEnd.value,

      // Fixed shadow
      [`${cellPrefixCls.value}-fix-start-shadow`]: fixedStartShadow,
      [`${cellPrefixCls.value}-fix-start-shadow-show`]: fixedStartShadow && showFixStartShadow.value,
      [`${cellPrefixCls.value}-fix-end-shadow`]: fixedEndShadow,
      [`${cellPrefixCls.value}-fix-end-shadow-show`]: fixedEndShadow && showFixEndShadow.value,

      [`${cellPrefixCls.value}-ellipsis`]: ellipsis,
      [`${cellPrefixCls.value}-with-append`]: appendNode,
      [`${cellPrefixCls.value}-fix-sticky`]: (isFixStart.value || isFixEnd.value) && isSticky,
      [`${cellPrefixCls.value}-row-hover`]: !legacyCellProps.value && hovering.value,
    },
    additionalProps.class,
    legacyCellProps?.value?.class,
  ),
);

// >>>>> Style
const alignStyle = computed(() => {
  const result: CSSProperties = {};
  if (align) {
    result.textAlign = align;
  }
  return result;
});

// The order is important since user can overwrite style.
// For example ant-design/ant-design#51763
const mergedStyle = computed(() => ({
  ...legacyCellProps?.value?.style,
  ...fixedStyle?.value,
  ...alignStyle?.value,
  ...(additionalProps.style as CSSProperties),
  ...style,
}));

// >>>>> Children Node
const MergedChildNode = () => {
  let mergedChildNode = childNode.value;

  // Not crash if final `childNode` is not validate ReactNode
  if (typeof mergedChildNode === 'object' && !Array.isArray(mergedChildNode) && !isValidElement(mergedChildNode)) {
    mergedChildNode = null;
  }

  if (ellipsis && (fixedStartShadow || fixedEndShadow)) {
    mergedChildNode = <span class={`${cellPrefixCls.value}-content`}>{mergedChildNode}</span>;
  }
  return mergedChildNode;
};
</script>
<template>
  <template v-if="mergedColSpan === 0 || mergedRowSpan === 0"></template>
  <component
    v-else
    :is="Component"
    v-bind="{ ...legacyCellProps, ...additionalProps }"
    :class="mergedClassName"
    :style="mergedStyle"
    :title="title"
    :scope="scope"
    @mouseenter="(e) => (rowHoverable ? onMouseenter(e) : undefined)"
    @mouseleave="(e) => (rowHoverable ? onMouseleave(e) : undefined)"
    :colspan="mergedColSpan !== 1 ? mergedColSpan : null"
    :rowspan="mergedRowSpan !== 1 ? mergedRowSpan : null"
  >
    <Render :content="appendNode" />
    <MergedChildNode />
  </component>
</template>
