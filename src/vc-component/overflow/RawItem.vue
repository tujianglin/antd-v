<script lang="tsx" setup>
import clsx from 'clsx';
import { isEmpty, omit } from 'lodash-es';
import { ref, type HTMLAttributes } from 'vue';
import { OverflowContextProvider, useOverflowContextInject } from './context';
import Item from './Item.vue';

// export type ComponentType

export interface RawItemProps extends /* @vue-ignore */ HTMLAttributes {
  component?: string;
}

defineOptions({ name: 'RawItem', inheritAttrs: false, compatConfig: { MODE: 3 } });
const props = withDefaults(defineProps<RawItemProps>(), { component: 'div' });

const context = useOverflowContextInject();

const domRef = ref();
</script>
<template>
  <template v-if="isEmpty(context)">
    <component :is="props.component" v-bind="$attrs" ref="domRef" />
  </template>
  <OverflowContextProvider v-else :value="null">
    <Item
      ref="domRef"
      :class="clsx(context.class, $attrs.class)"
      v-bind="{ ...omit(context, 'class'), ...omit($attrs, 'class'), component: props.component }"
    >
      <slot></slot>
    </Item>
  </OverflowContextProvider>
</template>
