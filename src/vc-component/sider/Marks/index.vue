<script lang="tsx" setup>
import { Render } from '@/components';
import { type CSSProperties } from 'vue';
import Mark from './Mark.vue';
export interface MarkObj {
  style?: CSSProperties;
  label?: any;
}

export interface InternalMarkObj extends MarkObj {
  value: number;
}

export interface MarksProps {
  prefixCls: string;
  marks?: InternalMarkObj[];
  onClick: (value: number) => void;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, marks, onClick } = defineProps<MarksProps>();

const markPrefixCls = `${prefixCls}-mark`;
</script>
<template>
  <div v-if="marks?.length" :class="markPrefixCls">
    <Mark
      v-for="{ value, style, label } in marks"
      :key="value"
      :prefix-cls="markPrefixCls"
      :style="style"
      :value="value"
      @click="onClick"
    >
      <Render :content="label" />
    </Mark>
  </div>
</template>
