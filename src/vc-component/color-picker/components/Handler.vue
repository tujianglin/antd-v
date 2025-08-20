<script lang="tsx" setup>
import clsx from 'clsx';
import {} from 'vue';
type HandlerSize = 'default' | 'small';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

defineProps<{ size?: HandlerSize; color?: string; prefixCls?: string }>();
</script>
<template>
  <div
    :class="
      clsx(`${prefixCls}-handler`, {
        [`${prefixCls}-handler-sm`]: size === 'small',
      })
    "
    :style="{ backgroundColor: color }"
  ></div>
</template>
