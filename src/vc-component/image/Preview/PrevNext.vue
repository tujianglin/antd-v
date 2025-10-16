<script lang="tsx" setup>
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { computed } from 'vue';
import type { OperationIcons } from './index.vue';

export interface PrevNextProps {
  prefixCls: string;
  onActive: (offset: number) => void;
  current: number;
  count: number;
  icons: OperationIcons;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, onActive, current, count, icons } = defineProps<PrevNextProps>();

const switchCls = computed(() => `${prefixCls}-switch`);
</script>
<template>
  <div
    :class="
      clsx(switchCls, `${switchCls}-prev`, {
        [`${switchCls}-disabled`]: current === 0,
      })
    "
    @click="() => onActive(-1)"
  >
    <Render :content="icons.prev" />
  </div>
  <div
    :class="
      clsx(switchCls, `${switchCls}-next`, {
        [`${switchCls}-disabled`]: current === count - 1,
      })
    "
    @click="() => onActive(1)"
  >
    <Render :content="icons.next" />
  </div>
</template>
