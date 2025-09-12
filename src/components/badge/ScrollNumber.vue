<script lang="tsx" setup>
import { computed, toRefs, type CSSProperties, type VNode } from 'vue';
import SingleNumber from './SingleNumber.vue';
import { useConfigContextInject } from '../config-provider';
import clsx from 'clsx';
import { cloneElement } from '../_util/reactNode';
import { flattenChildren } from '@/vc-util/Dom/findDOMNode';
import Render from '../render';
import type { VueNode } from '@/vc-util/type';

export interface ScrollNumberProps {
  prefixCls?: string;
  class?: string;
  motionClassName?: string;
  count?: VueNode;
  component?: string;
  style?: CSSProperties;
  title?: string | number | null;
  show: boolean;
}

export interface ScrollNumberState {
  animateStarted?: boolean;
  count?: VueNode;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls: customizePrefixCls,
  count,
  class: className,
  motionClassName,
  style,
  title,
  show,
  component: Component = 'sup',
  ...restProps
} = defineProps<ScrollNumberProps>();
const slots = defineSlots<{ default: () => VNode[]; count: () => VNode[] }>();
const countNode = computed(() => slots.count || count);

const { getPrefixCls } = toRefs(useConfigContextInject());
const prefixCls = computed(() => getPrefixCls.value('scroll-number', customizePrefixCls));

// ============================ Render ============================
const newProps = computed(() => {
  const result = {
    ...restProps,
    'data-show': show,
    style,
    class: clsx(prefixCls.value, className, motionClassName),
    title: title as string,
  };

  // allow specify the border
  // mock border-color by box-shadow for compatible with old usage:
  // <Badge count={4} style={{ backgroundColor: '#fff', color: '#999', borderColor: '#d9d9d9' }} />
  if (style?.borderColor) {
    result.style = {
      ...style,
      boxShadow: `0 0 0 1px ${style.borderColor} inset`,
    };
  }
  return result;
});

// Only integer need motion
const NumberNodes = () => {
  let result: any = countNode.value;
  if (countNode.value && Number(countNode.value) % 1 === 0) {
    const numberList = String(countNode.value).split('');
    result = (
      <bdi>
        {numberList.map((num, i) => (
          <SingleNumber prefixCls={prefixCls.value} count={Number(countNode.value)} value={num} key={numberList.length - i} />
        ))}
      </bdi>
    );
  }
  return <Render content={result}></Render>;
};

const children = computed(() => flattenChildren(slots.default?.())[0]);
</script>
<template>
  <component
    v-if="children"
    :is="
      cloneElement(children, (oriProps) => {
        return {
          class: clsx(`${prefixCls}-custom-component`, oriProps?.className, motionClassName),
        };
      })
    "
  />
  <component v-else :is="Component" v-bind="newProps">
    <NumberNodes />
  </component>
</template>
