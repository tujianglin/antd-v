<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import { omit } from 'lodash-es';
import { computed, type CSSProperties } from 'vue';
import { isPresetSize } from '../_util/gapSize';
import useOrientation from '../_util/hooks/useOrientation';
import { useConfigContextInject } from '../config-provider';
import type { FlexProps } from './interface';
import useStyle from './style';
import createFlexClassNames from './utils';

defineOptions({ name: 'Flex', inheritAttrs: false });

const props = withDefaults(defineProps<FlexProps>(), { component: 'div' });

const config = useConfigContextInject();

const prefixCls = config.getPrefixCls('flex', props.prefixCls);

const [hashId, cssVarCls] = useStyle(prefixCls);

const merged = useOrientation(
  computed(() => props.orientation),
  computed(() => props.vertical ?? config.flex?.vertical),
);

const mergedCls = computed(() => {
  return cn(
    props.class,
    props.rootClassName,
    config.flex?.class,
    prefixCls,
    hashId,
    cssVarCls,
    createFlexClassNames(prefixCls, props),
    {
      [`${prefixCls}-rtl`]: config.direction === 'rtl',
      [`${prefixCls}-gap-${props.gap}`]: isPresetSize(props.gap),
      [`${prefixCls}-vertical`]: merged.mergedVertical,
    },
  );
});

const mergedStyle = computed((): CSSProperties => {
  const result: CSSProperties = { ...config.flex?.style, ...props.style };
  if (props.flex) {
    result.flex = props.flex;
  }
  if (props.gap && !isPresetSize(props.gap)) {
    result.gap = props.gap;
  }
  return result;
});

const delegatedProps = computed(() => {
  return omit(props, [
    'prefixCls',
    'rootClassName',
    'class',
    'style',
    'flex',
    'gap',
    'vertical',
    'component',
    'justify',
    'wrap',
    'align',
  ]);
});
</script>
<template>
  <component :is="component" :class="mergedCls" :style="mergedStyle" v-bind="delegatedProps">
    <slot></slot>
  </component>
</template>
