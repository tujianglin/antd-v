<script lang="tsx" setup>
import clsx from 'clsx';
import {} from 'vue';

interface IndentProps {
  prefixCls: string;
  level: number | undefined;
  isStart: boolean[];
  isEnd: boolean[];
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, level, isStart, isEnd } = defineProps<IndentProps>();

const baseClassName = `${prefixCls}-indent-unit`;
</script>
<template>
  <span aria-hidden="true" :class="`${prefixCls}-indent`">
    <span
      v-for="i in level"
      :key="i"
      :class="
        clsx(baseClassName, {
          [`${baseClassName}-start`]: isStart[i],
          [`${baseClassName}-end`]: isEnd[i],
        })
      "
    ></span>
  </span>
</template>
