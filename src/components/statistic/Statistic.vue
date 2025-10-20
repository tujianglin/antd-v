<script lang="tsx" setup>
import { computed, ref, toRefs, type CSSProperties } from 'vue';
import { useComponentConfig } from '../config-provider/context';
import StatisticNumber from './Number.vue';
import useStyle from './style';
import type { FormatConfig, valueType } from './utils';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import pickAttrs from '@/vc-util/pickAttrs';
import Render from '@/vc-component/render';
import Skeleton from '../skeleton';

export type SemanticName = 'root' | 'content' | 'title' | 'header' | 'prefix' | 'suffix';
export interface StatisticRef {
  nativeElement: HTMLDivElement;
}

export interface StatisticProps extends FormatConfig {
  prefixCls?: string;
  class?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  rootClassName?: string;
  style?: CSSProperties;
  value?: valueType;
  valueRender?: (node: VueNode) => VueNode;
  title?: VueNode;
  prefix?: VueNode;
  suffix?: VueNode;
  loading?: boolean;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  role?: string;
}

defineOptions({ name: 'Statistic', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  class: className,
  rootClassName,
  style,
  value = 0,
  title,
  valueRender,
  prefix,
  suffix,
  loading = false,
  /* --- FormatConfig starts --- */
  formatter,
  precision,
  decimalSeparator = '.',
  groupSeparator = ',',
  /* --- FormatConfig starts --- */
  onMouseenter,
  onMouseleave,
  styles,
  classNames: statisticClassNames,
  ...rest
} = defineProps<StatisticProps>();

const {
  getPrefixCls,
  direction,
  class: contextClassName,
  style: contextStyle,
  classNames: contextClassNames,
  styles: contextStyles,
} = toRefs(useComponentConfig('statistic'));

const prefixCls = computed(() => getPrefixCls.value('statistic', customizePrefixCls));

const [hashId, cssVarCls] = useStyle(prefixCls);

const ValueNode = () => (
  <StatisticNumber
    decimalSeparator={decimalSeparator}
    groupSeparator={groupSeparator}
    prefixCls={prefixCls.value}
    formatter={formatter}
    precision={precision}
    value={value}
  />
);

const rootClassNames = computed(() =>
  clsx(
    prefixCls.value,
    {
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    contextClassName?.value,
    className,
    rootClassName,
    contextClassNames?.value?.root,
    statisticClassNames?.root,
    hashId.value,
    cssVarCls.value,
  ),
);

const headerClassNames = computed(() =>
  clsx(`${prefixCls.value}-header`, contextClassNames?.value?.header, statisticClassNames?.header),
);

const titleClassNames = computed(() =>
  clsx(`${prefixCls.value}-title`, contextClassNames?.value?.title, statisticClassNames?.title),
);

const contentClassNames = computed(() =>
  clsx(`${prefixCls.value}-content`, contextClassNames?.value?.content, statisticClassNames?.content),
);

const prefixClassNames = computed(() =>
  clsx(`${prefixCls.value}-content-prefix`, contextClassNames?.value?.prefix, statisticClassNames?.prefix),
);

const suffixClassNames = computed(() =>
  clsx(`${prefixCls.value}-content-suffix`, contextClassNames?.value?.suffix, statisticClassNames?.suffix),
);
const internalRef = ref<HTMLDivElement>(null);

defineExpose({
  get nativeElement() {
    return internalRef.value;
  },
});

const restProps = computed(() => pickAttrs(rest, { aria: true, data: true }));
</script>
<template>
  <div
    v-bind="restProps"
    :class="rootClassNames"
    :style="{ ...contextStyles.root, ...styles?.root, ...contextStyle, ...style }"
    ref="internalRef"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <div v-if="title" :class="headerClassNames" :style="{ ...contextStyles.header, ...styles?.header }">
      <div :class="titleClassNames" :style="{ ...contextStyles.title, ...styles?.title }">
        <Render :content="title" />
      </div>
    </div>
    <Skeleton :paragraph="false" :loading="loading" :class="`${prefixCls}-skeleton`">
      <div :class="contentClassNames" :style="{ ...contextStyles.content, ...styles?.content }">
        <span v-if="prefix" :class="prefixClassNames" :style="{ ...contextStyles.prefix, ...styles?.prefix }">
          <Render :content="prefix" />
        </span>
        <Render v-if="valueRender" :content="valueRender(ValueNode)" />
        <ValueNode v-else />
        <span v-if="suffix" :class="suffixClassNames" :style="{ ...contextStyles.suffix, ...styles?.suffix }">
          <Render :content="suffix" />
        </span>
      </div>
    </Skeleton>
  </div>
</template>
