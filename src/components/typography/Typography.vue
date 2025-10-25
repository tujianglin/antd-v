<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, toRefs, useTemplateRef, type CSSProperties, type HTMLAttributes } from 'vue';
import type { DirectionType } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import useStyle from './style';

export interface TypographyProps extends /** @vue-ignore */ HTMLAttributes {
  id?: string;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: CSSProperties;
  /** @internal */
  component?: any;
  direction?: DirectionType;
}

defineOptions({ name: 'Typography', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  component: Component = 'article',
  class: className,
  rootClassName,
  direction: typographyDirection,
  style,
  ...restProps
} = defineProps<TypographyProps>();

const {
  getPrefixCls,
  direction: contextDirection,
  class: contextClassName,
  style: contextStyle,
} = toRefs(useComponentConfig('typography'));

const direction = computed(() => typographyDirection ?? contextDirection?.value);
const prefixCls = computed(() => getPrefixCls.value('typography', customizePrefixCls));

// Style
const [, hashId] = useStyle(prefixCls);
const componentClassName = computed(() =>
  clsx(
    prefixCls.value,
    contextClassName?.value,
    {
      [`${prefixCls.value}-rtl`]: direction?.value === 'rtl',
    },
    className,
    rootClassName,
    hashId.value,
  ),
);

const mergedStyle = computed<CSSProperties>(() => ({ ...contextStyle, ...style }));

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return (domRef.value || {}) as HTMLDivElement;
  },
});
</script>
<template>
  <component ref="domRef" :is="Component" :class="componentClassName" :style="mergedStyle" v-bind="{ ...restProps, ...$attrs }">
    <slot></slot>
  </component>
</template>
