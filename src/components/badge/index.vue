<script lang="tsx" setup>
import { computed, ref, toRefs, watchEffect, type CSSProperties, type HTMLAttributes, type VNode } from 'vue';
import type { PresetStatusColorType } from '../_util/colors';
import { isPresetColor } from '../_util/colors';
import type { LiteralUnion } from '../_util/type';
import { useComponentConfig } from '../config-provider/context';
import type { PresetColorKey } from '../theme/internal';
import ScrollNumber from './ScrollNumber.vue';
import useStyle from './style';
import clsx from 'clsx';
import Render from '@/vc-component/render';
import CSSMotion from '@/vc-component/motion';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import type { VueNode } from '@/vc-util/type';
import { cloneElement } from '@/vc-util/Children/util';

export type { ScrollNumberProps } from './ScrollNumber.vue';

type SemanticName = 'root' | 'indicator';
export interface BadgeProps extends /** @vue-ignore */ HTMLAttributes {
  /** Number to show in badge */
  count?: VueNode;
  showZero?: boolean;
  /** Max count to show */
  overflowCount?: number;
  /** Whether to show red dot without number */
  dot?: boolean;
  style?: CSSProperties;
  prefixCls?: string;
  scrollNumberPrefixCls?: string;
  class?: string;
  rootClassName?: string;
  status?: PresetStatusColorType;
  color?: LiteralUnion<PresetColorKey>;
  text?: VueNode;
  size?: 'default' | 'small';
  offset?: [number | string, number | string];
  title?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  scrollNumberPrefixCls: customizeScrollNumberPrefixCls,
  status,
  text,
  color,
  count = null,
  overflowCount = 99,
  dot = false,
  size = 'default',
  title,
  offset,
  style,
  class: className,
  rootClassName,
  classNames,
  styles,
  showZero = false,
  ...restProps
} = defineProps<BadgeProps>();
const slots = defineSlots<{ default: () => VNode[]; text: () => VNode[]; count: () => VNode[] }>();
const textNode = computed(() => slots.text || text);
const countNode = computed(() => slots.count || count);

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('badge'));
const prefixCls = computed(() => getPrefixCls.value('badge', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

// ================================ Misc ================================
const numberedDisplayCount = computed(
  () =>
    ((countNode.value as number) > (overflowCount as number) ? `${overflowCount}+` : countNode.value) as string | number | null,
);

const isZero = computed(() => numberedDisplayCount?.value === '0' || numberedDisplayCount?.value === 0);

const ignoreCount = computed(() => countNode.value === null || (isZero.value && !showZero));

const hasStatus = computed(
  () => ((status !== null && status !== undefined) || (color !== null && color !== undefined)) && ignoreCount.value,
);

const hasStatusValue = computed(() => (status !== null && status !== undefined) || !isZero.value);

const showAsDot = computed(() => dot && !isZero.value);

const mergedCount = computed(() => (showAsDot.value ? '' : numberedDisplayCount.value));

const isHidden = computed(() => {
  const isEmpty = mergedCount.value === null || mergedCount.value === undefined || mergedCount.value === '';
  return (isEmpty || (isZero.value && !showZero)) && !showAsDot.value;
});

// Count should be cache in case hidden change it
const countRef = ref(countNode.value);
watchEffect(() => {
  if (!isHidden.value) {
    countRef.value = countNode.value;
  }
});
const livingCount = computed(() => countRef.value);

// We need cache count since remove motion should not change count display
const displayCountRef = ref(mergedCount.value);
watchEffect(() => {
  if (!isHidden.value) {
    displayCountRef.value = mergedCount.value;
  }
});
const displayCount = computed(() => displayCountRef.value);

// We will cache the dot status to avoid shaking on leaved motion
const isDotRef = ref(showAsDot.value);
watchEffect(() => {
  if (!isHidden.value) {
    isDotRef.value = showAsDot.value;
  }
});
// =============================== Styles ===============================
const mergedStyle = computed<CSSProperties>(() => {
  if (!offset) {
    return { ...contextStyle, ...style };
  }

  const offsetStyle: CSSProperties = { marginTop: `${offset[1]}px` };

  if (direction.value === 'rtl') {
    offsetStyle.left = `${parseInt(offset[0] as string, 10)}px`;
  } else {
    offsetStyle.right = `${-parseInt(offset[0] as string, 10)}px`;
  }

  return { ...offsetStyle, ...contextStyle, ...style };
});

// =============================== Render ===============================
// >>> Title
const titleNode = computed(
  () => title ?? (typeof livingCount.value === 'string' || typeof livingCount.value === 'number' ? livingCount.value : undefined),
);

// >>> Status Text
const statusTextNode = () => {
  return isHidden.value || !text ? null : <span class={`${prefixCls.value}-status-text`}>{text}</span>;
};

// >>> Display Component
const displayNode = () => {
  return !livingCount.value || typeof livingCount.value !== 'object'
    ? undefined
    : cloneElement(livingCount.value, (oriProps) => ({
        style: { ...mergedStyle.value, ...oriProps.style },
      }));
};

// InternalColor
const isInternalColor = computed(() => isPresetColor(color, false));

// Shared styles
const statusCls = computed(() => {
  return clsx(classNames?.indicator, contextClassNames?.value?.indicator, {
    [`${prefixCls.value}-status-dot`]: hasStatus.value,
    [`${prefixCls.value}-status-${status}`]: !!status,
    [`${prefixCls.value}-color-${color}`]: isInternalColor.value,
  });
});

const statusStyle = computed(() => {
  const result: CSSProperties = {};
  if (color && !isInternalColor.value) {
    result.color = color;
    result.background = color;
  }
  return result;
});

const badgeClassName = computed(() =>
  clsx(
    prefixCls.value,
    {
      [`${prefixCls.value}-status`]: hasStatus.value,
      [`${prefixCls.value}-not-a-wrapper`]: !slots.default,
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    className,
    rootClassName,
    contextClassName?.value,
    contextClassNames.value.root,
    classNames?.root,
    hashId.value,
    cssVarCls.value,
  ),
);

const scrollNumberStyle = computed<CSSProperties>(() => {
  let result = {
    ...styles?.indicator,
    ...contextStyles.value.indicator,
    ...mergedStyle.value,
  };

  if (color && !isInternalColor.value) {
    result = result || {};
    result.background = color;
  }
  return result;
});
const children = computed(() => flattenChildren(slots.default?.())[0]);
</script>
<template>
  <span
    v-if="!children && hasStatus && (text || hasStatusValue || !ignoreCount)"
    v-bind="{ ...restProps, ...$attrs }"
    :class="badgeClassName"
    :style="{ ...styles?.root, ...contextStyles?.root, ...mergedStyle }"
  >
    <span :class="statusCls" :style="{ ...styles?.indicator, ...contextStyles.indicator, ...statusStyle }"> </span>
    <span v-if="textNode" :style="{ color: mergedStyle.color }" :class="`${prefixCls}-status-text`">
      <Render :content="textNode" />
    </span>
  </span>
  <span v-else v-bind="{ ...restProps, ...$attrs }" :class="badgeClassName" :style="{ ...contextStyles.root, ...styles?.root }">
    <slot></slot>
    <CSSMotion :visible="!isHidden" :motion-name="`${prefixCls}-zoom`" :motion-appear="false" :motion-deadline="1000">
      <template #default="{ class: motionClassName, ref: motionRef }">
        <ScrollNumber
          :ref="motionRef"
          :prefix-cls="getPrefixCls('scroll-number', customizeScrollNumberPrefixCls)"
          :show="!isHidden"
          :motion-class-name="motionClassName"
          :class="
            clsx(classNames?.indicator, contextClassNames.indicator, {
              [`${prefixCls}-dot`]: isDotRef,
              [`${prefixCls}-count`]: !isDotRef,
              [`${prefixCls}-count-sm`]: size === 'small',
              [`${prefixCls}-multiple-words`]: !isDotRef && displayCount && displayCount.toString().length > 1,
              [`${prefixCls}-status-${status}`]: !!status,
              [`${prefixCls}-color-${color}`]: isInternalColor,
            })
          "
          :count="displayCount"
          :title="titleNode"
          :style="scrollNumberStyle"
          key="scrollNumber"
        >
          <Render v-if="displayNode()" :content="displayNode" />
        </ScrollNumber>
      </template>
    </CSSMotion>
    <Render :content="statusTextNode" />
  </span>
</template>
