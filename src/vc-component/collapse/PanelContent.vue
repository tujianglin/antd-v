<script lang="tsx" setup>
import clsx from 'clsx';
import { ref, watch } from 'vue';
import type { CollapsePanelProps } from './interface';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  forceRender,
  class: className,
  style,
  isActive,
  role,
  classNames: customizeClassNames,
  styles,
} = defineProps<CollapsePanelProps>();

const rendered = ref(isActive || forceRender);

watch(
  [() => forceRender, () => isActive],
  () => {
    if (forceRender || isActive) {
      rendered.value = true;
    }
  },
  { immediate: true, deep: true },
);

const domRef = ref<HTMLDivElement>();
</script>
<template>
  <div
    v-if="rendered"
    ref="domRef"
    :class="
      clsx(
        `${prefixCls}-panel`,
        {
          [`${prefixCls}-panel-active`]: isActive,
          [`${prefixCls}-panel-inactive`]: !isActive,
        },
        className,
      )
    "
    :style="style"
    :role="role"
  >
    <div :class="clsx(`${prefixCls}-body`, customizeClassNames?.body)" :style="styles?.body">
      <slot></slot>
    </div>
  </div>
</template>
