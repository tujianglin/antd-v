<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import { LoadingOutlined } from '@ant-design/icons-vue';
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';
import IconWrapper from './IconWrapper.vue';

export type DefaultLoadingIconProps = {
  prefixCls: string;
  existIcon: boolean;
  loading?: boolean | object;
  class?: string;
  style?: CSSProperties;
  mount?: boolean;
};

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, loading, existIcon, class: className, style, mount } = defineProps<DefaultLoadingIconProps>();

const getCollapsedWidth = (): CSSProperties => ({
  width: 0,
  opacity: 0,
  transform: 'scale(0)',
});

const getRealWidth = (node: HTMLElement): CSSProperties => ({
  width: `${node.scrollWidth}px`,
  opacity: 1,
  transform: 'scale(1)',
});

const visible = computed(() => !!loading);

const mergedIconCls = clsx(`${prefixCls}-loading-icon`, className);
</script>
<template>
  <IconWrapper v-if="existIcon" :prefix-cls="mergedIconCls" :class="mergedIconCls" :style="style">
    <LoadingOutlined />
  </IconWrapper>
  <template v-else>
    <CSSMotion
      :visible="visible"
      :motion-name="`${prefixCls}-loading-icon-motion`"
      :motion-appear="!mount"
      :motion-enter="!mount"
      :motion-leave="!mount"
      remove-on-leave
      @appear-start="getCollapsedWidth"
      @appear-active="getRealWidth"
      @enter-start="getCollapsedWidth"
      @enter-active="getRealWidth"
      @leave-start="getRealWidth"
      @leave-active="getCollapsedWidth"
    >
      <template #default="{ class: motionCls, style: motionStyle, ref: motionRef }">
        <IconWrapper
          :ref="motionRef"
          :prefix-cls="mergedIconCls"
          :class="clsx(mergedIconCls, motionCls)"
          :style="{ ...style, ...motionStyle }"
        >
          <LoadingOutlined />
        </IconWrapper>
      </template>
    </CSSMotion>
  </template>
</template>
