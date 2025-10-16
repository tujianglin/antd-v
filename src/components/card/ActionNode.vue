<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import { type CSSProperties } from 'vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  actionClasses,
  actions = [],
  actionStyle,
} = defineProps<{ actionClasses: string; actions?: VueNode[]; actionStyle: CSSProperties }>();
</script>
<template>
  <ul :class="actionClasses" :style="actionStyle">
    <li v-for="(action, index) in actions" :style="{ width: `${100 / actions.length}%` }" :key="`action-${index}`">
      <span>
        <Render :content="action" />
      </span>
    </li>
  </ul>
</template>
