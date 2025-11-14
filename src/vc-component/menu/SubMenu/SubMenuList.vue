<script lang="tsx" setup>
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import { ref, toRefs, type HTMLAttributes } from 'vue';
import { useMenuContextInject } from '../context/MenuContext';

export interface SubMenuListProps extends /** @vue-ignore */ HTMLAttributes {}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<SubMenuListProps>();

const { prefixCls, mode, rtl } = toRefs(useMenuContextInject());

const domRef = ref();

defineExpose({
  get el() {
    return domRef.value || {};
  },
});
</script>
<template>
  <ul
    :class="
      clsx(
        prefixCls,
        rtl && `${prefixCls}-rtl`,
        `${prefixCls}-sub`,
        `${prefixCls}-${mode === 'inline' ? 'inline' : 'vertical'}`,
        $attrs?.class,
      )
    "
    role="menu"
    v-bind="omit($attrs, ['class'])"
    data-menu-list
    ref="domRef"
  >
    <slot></slot>
  </ul>
</template>
