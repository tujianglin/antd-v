<script lang="tsx" setup>
import type {
  SegmentedLabeledOption as RcSegmentedLabeledOption,
  SegmentedProps as RCSegmentedProps,
  SegmentedValue as RcSegmentedValue,
  SegmentedRawOption,
} from '@/vc-component/segmented/index.vue';
import RcSegmented from '@/vc-component/segmented/index.vue';
import useMergeSemantic from '../_util/hooks/useMergeSemantic';
import type { Orientation } from '../_util/hooks/useOrientation';
import useOrientation from '../_util/hooks/useOrientation';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import type { SizeType } from '../config-provider/SizeContext';
import useStyle from './style';
import type { VueNode } from '@/vc-util/type';
import type { TooltipProps } from '../tooltip';
import { computed, toRefs, useId, type CSSProperties } from 'vue';
import clsx from 'clsx';
import Render from '../render';
import Tooltip from '../tooltip';

export type { SegmentedValue } from '@/vc-component/segmented/index.vue';
export type SemanticName = 'root' | 'icon' | 'label' | 'item';

interface SegmentedLabeledOptionWithoutIcon<ValueType = RcSegmentedValue> extends RcSegmentedLabeledOption<ValueType> {
  label: RcSegmentedLabeledOption['label'];
  tooltip?: string | Omit<TooltipProps, 'children'>;
}

interface SegmentedLabeledOptionWithIcon<ValueType = RcSegmentedValue>
  extends Omit<RcSegmentedLabeledOption<ValueType>, 'label'> {
  label?: RcSegmentedLabeledOption['label'];
  /** Set icon for Segmented item */
  icon: VueNode;
  tooltip?: string | Omit<TooltipProps, 'children'>;
}

export type SegmentedLabeledOption<ValueType = RcSegmentedValue> =
  | SegmentedLabeledOptionWithIcon<ValueType>
  | SegmentedLabeledOptionWithoutIcon<ValueType>;

export type SegmentedOptions<T = SegmentedRawOption> = (T | SegmentedLabeledOption<T>)[];

export interface SegmentedProps<ValueType = RcSegmentedValue>
  extends Omit<RCSegmentedProps<ValueType>, 'size' | 'options' | 'itemRender'> {
  rootClassName?: string;
  options?: SegmentedOptions<ValueType>;
  /** Option to fit width to its parent's width */
  block?: boolean;
  /** Option to control the display size */
  size?: SizeType;
  vertical?: boolean;
  orientation?: Orientation;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  shape?: 'default' | 'round';
}

defineOptions({ name: 'Segmented', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  block,
  options = [],
  size: customSize = 'middle',
  style,
  vertical,
  orientation,
  shape = 'default',
  name = useId(),
  styles,
  classNames: segmentedClassNames,
  ...restProps
} = defineProps<SegmentedProps>();

const value = defineModel<string | number>('value');

function isSegmentedLabeledOptionWithIcon(
  option: SegmentedRawOption | SegmentedLabeledOptionWithIcon | SegmentedLabeledOptionWithoutIcon,
): option is SegmentedLabeledOptionWithIcon {
  return typeof option === 'object' && !!(option as SegmentedLabeledOptionWithIcon)?.icon;
}
const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('segmented'));

const [mergedClassNames, mergedStyles] = useMergeSemantic(
  computed(() => [contextClassNames?.value, segmentedClassNames]),
  computed(() => [contextStyles?.value, styles]),
);

const prefixCls = computed(() => getPrefixCls.value('segmented', customizePrefixCls));
// Style
const [hashId, cssVarCls] = useStyle(prefixCls);

// ===================== Size =====================
const mergedSize = useSize(computed(() => customSize));

// syntactic sugar to support `icon` for Segmented Item
const extendedOptions = computed<RCSegmentedProps['options']>(() =>
  options.map((option) => {
    if (isSegmentedLabeledOptionWithIcon(option)) {
      const { icon, label, ...restOption } = option;
      return {
        ...restOption,
        label: (
          <>
            <span class={clsx(`${prefixCls.value}-item-icon`, mergedClassNames?.value?.icon)} style={mergedStyles?.value?.icon}>
              <Render content={icon}></Render>
            </span>
            {label && (
              <span>
                <Render content={label}></Render>
              </span>
            )}
          </>
        ),
      };
    }
    return option;
  }),
);

const [, mergedVertical] = useOrientation(
  computed(() => orientation),
  computed(() => vertical),
);

const cls = computed(() =>
  clsx(
    className,
    rootClassName,
    contextClassName?.value,
    mergedClassNames?.value?.root,
    {
      [`${prefixCls.value}-block`]: block,
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
      [`${prefixCls.value}-vertical`]: mergedVertical.value,
      [`${prefixCls.value}-shape-${shape}`]: shape === 'round',
    },
    hashId.value,
    cssVarCls.value,
  ),
);

const mergedStyle = computed(() => ({
  ...mergedStyles?.value?.root,
  ...contextStyle?.value,
  ...style,
}));

const itemRender = (node: VueNode, { item }: { item: SegmentedLabeledOption }) => {
  if (!item.tooltip) {
    return node;
  }
  const tooltipProps: TooltipProps = typeof item.tooltip === 'object' ? item.tooltip : { title: item.tooltip };
  return (
    <Tooltip {...tooltipProps}>
      <Render content={node}></Render>
    </Tooltip>
  );
};
</script>
<template>
  <RcSegmented
    v-bind="restProps"
    v-model:value="value"
    :name="name"
    :class="cls"
    :style="mergedStyle"
    :class-names="{ label: mergedClassNames.label, item: mergedClassNames.item }"
    :styles="{
      item: mergedStyles.item,
      label: mergedStyles.label,
    }"
    :item-render="itemRender"
    :options="extendedOptions"
    :prefix-cls="prefixCls"
    :direction="direction"
    :vertical="mergedVertical"
  />
</template>
