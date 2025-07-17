<script lang="tsx" setup>
import { cn } from '@/utils/cn';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { computed, nextTick, type CSSProperties } from 'vue';
import IconWrapper from './IconWrapper.vue';

export type DefaultLoadingIconProps = {
  prefixCls: string;
  existIcon: boolean;
  loading?: boolean | object;
  class?: string;
  style?: CSSProperties;
};

const { prefixCls, loading, existIcon, class: className, style } = defineProps<DefaultLoadingIconProps>();

const getCollapsedWidth = (): CSSProperties => ({
  width: 0,
  opacity: 0,
  transform: 'scale(0)',
});

const getRealWidth = (node) => {
  nextTick(() => {
    if (node) {
      node.style.width = `${node.scrollWidth}px`;
      node.style.opacity = '1';
      node.style.transform = 'scale(1)';
    }
  });
};

const resetStyle = (node) => {
  if (node && node.style) {
    node.style.width = null;
    node.style.opacity = null;
    node.style.transform = null;
  }
};

const onLeave = () => {
  setTimeout(() => {
    getCollapsedWidth();
  });
};

const visible = computed(() => !!loading);

const mergedIconCls = cn(`${prefixCls}-loading-icon`, className);
</script>
<template>
  <IconWrapper v-if="existIcon" :prefix-cls="mergedIconCls" :class="mergedIconCls" :style="style">
    <LoadingOutlined />
  </IconWrapper>
  <template v-else>
    <Transition
      :name="`${prefixCls}-loading-icon-motion`"
      @before-enter="getCollapsedWidth"
      @enter="getRealWidth"
      @after-enter="resetStyle"
      @before-leave="getRealWidth"
      @leave="onLeave"
      @after-leave="resetStyle"
    >
      <IconWrapper v-if="visible" :prefix-cls="mergedIconCls" :class="mergedIconCls" :style="style">
        <LoadingOutlined />
      </IconWrapper>
    </Transition>
  </template>
</template>
