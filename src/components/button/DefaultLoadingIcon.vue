<script lang="tsx" setup>
import { computed, nextTick, type CSSProperties } from 'vue';
import IconWrapper from './IconWrapper.vue';
import { cn } from '@/utils/cn';
import { LoadingOutlined } from '@ant-design/icons-vue';

export type DefaultLoadingIconProps = {
  prefixCls: string;
  existIcon: boolean;
  loading?: boolean | object;
  className?: string;
  style?: CSSProperties;
};

type InnerLoadingIconProps = {
  prefixCls: string;
  className?: string;
  style?: CSSProperties;
  iconClassName?: string;
};

const { prefixCls, loading, existIcon, className, style } = defineProps<DefaultLoadingIconProps>();

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

const InnerLoadingIcon = (props: InnerLoadingIconProps) => {
  const { prefixCls, className, style, iconClassName } = props;

  const mergedIconCls = cn(`${prefixCls}-loading-icon`, className);

  return (
    <IconWrapper prefixCls={mergedIconCls} className={mergedIconCls} style={style}>
      <LoadingOutlined class={iconClassName}></LoadingOutlined>
    </IconWrapper>
  );
};

const visible = computed(() => !!loading);
</script>
<template>
  <InnerLoadingIcon v-if="existIcon" :prefix-cls="prefixCls" :class-name="className" :style="style" />
  <Transition
    :name="`${prefixCls}-loading-icon-motion`"
    @before-enter="getCollapsedWidth"
    @enter="getRealWidth"
    @after-enter="resetStyle"
    @before-leave="getRealWidth"
    @leave="onLeave"
    @after-leave="resetStyle"
  >
    <InnerLoadingIcon v-if="visible" :prefix-cls="prefixCls" />
  </Transition>
</template>
