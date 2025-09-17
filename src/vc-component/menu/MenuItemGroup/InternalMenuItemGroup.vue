<script lang="tsx" setup>
import { Render } from '@/components';
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useMenuContextInject } from '../context/MenuContext';
import type { MenuItemGroupProps } from './index.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, title, children: _, ...restProps } = defineProps<MenuItemGroupProps>();

const { prefixCls, classNames: menuClassNames, styles } = toRefs(useMenuContextInject());

const groupPrefixCls = computed(() => `${prefixCls.value}-item-group`);
</script>
<template>
  <li role="presentation" v-bind="restProps" @click="(e) => e.stopPropagation()" :class="clsx(groupPrefixCls, className)">
    <div
      role="presentation"
      :class="clsx(`${groupPrefixCls}-title`, menuClassNames?.listTitle)"
      :style="styles?.listTitle"
      :title="typeof title === 'string' ? title : undefined"
    >
      <Render :content="title" />
    </div>
    <ul role="group" :class="clsx(`${groupPrefixCls}-list`, menuClassNames?.list)" :style="styles?.list">
      <slot></slot>
    </ul>
  </li>
</template>
