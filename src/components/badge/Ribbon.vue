<script lang="tsx" setup>
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties, type VNode } from 'vue';
import type { PresetColorType } from '../_util/colors';
import { isPresetColor } from '../_util/colors';
import type { LiteralUnion } from '../_util/type';
import { useComponentConfig } from '../config-provider/context';
import Render from '../render';
import useStyle from './style/ribbon';

type RibbonPlacement = 'start' | 'end';

type SemanticName = 'root' | 'content' | 'indicator';

export interface RibbonProps {
  class?: string;
  prefixCls?: string;
  style?: CSSProperties; // style of ribbon element, not the wrapper
  text?: VueNode;
  color?: LiteralUnion<PresetColorType>;
  placement?: RibbonPlacement;
  rootClassName?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  class: className,
  prefixCls: customizePrefixCls,
  style,
  color,
  text,
  placement = 'end',
  rootClassName,
  styles,
  classNames: ribbonClassNames,
} = defineProps<RibbonProps>();
const slots = defineSlots<{ text: () => VNode[]; default: () => VNode[] }>();

const textNode = computed(() => slots.text || text);

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('ribbon'));
const prefixCls = computed(() => getPrefixCls.value('ribbon', customizePrefixCls));

const wrapperCls = computed(() => `${prefixCls.value}-wrapper`);
const [hashId, cssVarCls] = useStyle(prefixCls, wrapperCls);

const colorInPreset = computed(() => isPresetColor(color, false));
const ribbonCls = computed(() => {
  return clsx(
    prefixCls.value,
    `${prefixCls.value}-placement-${placement}`,
    {
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      [`${prefixCls.value}-color-${color}`]: colorInPreset.value,
    },
    className,
    contextClassName?.value,
    contextClassNames.value.indicator,
    ribbonClassNames?.indicator,
  );
});

const colorStyle = computed(() => (color && !colorInPreset.value ? { background: color } : {}));
const cornerColorStyle = computed(() => (color && !colorInPreset.value ? { color } : {}));
</script>
<template>
  <div
    :class="clsx(wrapperCls, rootClassName, hashId, cssVarCls, ribbonClassNames?.root, contextClassNames.root)"
    :style="{ ...contextStyles.root, ...styles?.root }"
  >
    <slot></slot>
    <div
      :class="clsx(ribbonCls, hashId)"
      :style="{
        ...colorStyle,
        ...contextStyles.indicator,
        ...contextStyle,
        ...styles?.indicator,
        ...style,
      }"
    >
      <span
        :class="clsx(`${prefixCls}-content`, ribbonClassNames?.content, contextClassNames.content)"
        :style="{ ...contextStyles.content, ...styles?.content }"
      >
        <Render :content="textNode" />
      </span>
      <div :class="`${prefixCls}-corner`" :style="cornerColorStyle"></div>
    </div>
  </div>
</template>
