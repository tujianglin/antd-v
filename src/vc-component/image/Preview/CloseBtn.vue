<script lang="tsx" setup>
import Render from '@/vc-component/render';

export interface CloseBtnProps {
  prefixCls: string;
  icon?: any;
  onClick: (e: MouseEvent) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, icon, onClick } = defineProps<CloseBtnProps>();
</script>
<template>
  <button :class="`${prefixCls}-close`" @click="onClick">
    <Render :content="icon" />
  </button>
</template>
