<script lang="tsx" setup>
import {} from 'vue';
import Render from '../render';
interface OverlayProps {
  prefixCls?: string;
  title?: any;
  content?: any;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { title, content, prefixCls } = defineProps<OverlayProps>();
</script>
<template>
  <template v-if="!title && !content"></template>
  <template v-else>
    <div v-if="title" :class="`${prefixCls}-title`">
      <Render :content="title" />
    </div>
    <div v-if="content" :class="`${prefixCls}-inner-content`">
      <Render :content="content" />
    </div>
  </template>
</template>
