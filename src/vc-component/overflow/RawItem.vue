<script lang="tsx" setup>
import { composeRef } from '@/vc-util/ref';
import clsx from 'clsx';
import { isEmpty, omit } from 'lodash-es';
import { ref, type HTMLAttributes } from 'vue';
import { OverflowContextProvider, useOverflowContextInject } from './context';
import Item from './Item.vue';

// export type ComponentType

export interface RawItemProps extends /* @vue-ignore */ HTMLAttributes {
  component?: string;
  elementRef?: any;
}

defineOptions({ name: 'RawItem', inheritAttrs: false, compatConfig: { MODE: 3 } });
const props = withDefaults(defineProps<RawItemProps>(), { component: 'div' });

const context = useOverflowContextInject();

const domRef = ref();

defineExpose({
  get el() {
    return domRef.value || {};
  },
});
</script>
<template>
  <template v-if="isEmpty(context)">
    <component :is="props.component" v-bind="$attrs" :ref="composeRef((el) => (domRef = el), props.elementRef)">
      <slot></slot>
    </component>
  </template>
  <OverflowContextProvider v-else :value="null">
    <Item
      :ref="composeRef((el) => (domRef = el?.el), props.elementRef)"
      :class="clsx(context.class, $attrs.class)"
      v-bind="{ ...omit(context, 'class'), ...omit($attrs, 'class'), component: props.component }"
    >
      <slot></slot>
    </Item>
  </OverflowContextProvider>
</template>
