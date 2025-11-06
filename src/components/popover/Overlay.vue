<script lang="tsx" setup>
import Render from '@/vc-component/render';
import type { VueNode } from '@/vc-util/type';
import clsx from 'clsx';
import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';
import type { PopoverSemanticName } from './index.vue';

interface OverlayProps {
  prefixCls?: string;
  title?: VueNode;
  content?: VueNode;
  classNames?: SemanticClassNames<PopoverSemanticName>;
  styles?: SemanticStyles<PopoverSemanticName>;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { title, content, prefixCls, classNames, styles } = defineProps<OverlayProps>();
</script>
<template>
  <template v-if="!title && !content"></template>
  <template v-else>
    <div v-if="title" :class="clsx(`${prefixCls}-title`, classNames?.title)" :style="styles?.title">
      <Render :content="title" />
    </div>
    <div v-if="content" :class="clsx(`${prefixCls}-content`, classNames?.content)" :style="styles?.content">
      <Render :content="content" />
    </div>
  </template>
</template>
