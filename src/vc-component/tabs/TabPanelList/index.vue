<script lang="tsx" setup>
import CSSMotion from '@/vc-component/motion';
import clsx from 'clsx';
import { computed, toRefs, type CSSProperties } from 'vue';
import type { AnimatedConfig, TabPosition } from '../interface';
import { useTabContextInject } from '../TabContext';
import TabPane from './TabPane.vue';

export interface TabPanelListProps {
  activeKey: string;
  id: any;
  animated?: AnimatedConfig;
  tabPosition?: TabPosition;
  destroyOnHidden?: boolean;
  contentStyle?: CSSProperties;
  contentClassName?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { id, activeKey, animated, tabPosition, destroyOnHidden, contentStyle, contentClassName } =
  defineProps<TabPanelListProps>();

const { prefixCls, tabs } = toRefs(useTabContextInject());
const tabPaneAnimated = computed(() => animated?.tabPane);

const tabPanePrefixCls = computed(() => `${prefixCls.value}-tabpane`);
</script>
<template>
  <div :class="clsx(`${prefixCls}-content-holder`)">
    <div
      :class="
        clsx(`${prefixCls}-content`, `${prefixCls}-content-${tabPosition}`, {
          [`${prefixCls}-content-animated`]: tabPaneAnimated,
        })
      "
    >
      <template
        v-for="{
          key,
          forceRender,
          style: paneStyle,
          class: paneClassName,
          destroyOnHidden: itemDestroyOnHidden,
          ...restTabProps
        } in tabs"
        :key="key"
      >
        <CSSMotion
          :visible="key === activeKey"
          :force-render="forceRender"
          :remove-on-leave="!!(destroyOnHidden ?? itemDestroyOnHidden)"
          :leaved-class-name="`${tabPanePrefixCls}-hidden`"
          v-bind="animated?.tabPaneMotion"
        >
          <template #default="{ class: motionClassName, style: motionStyle, ref: motionRef }">
            <TabPane
              :ref="motionRef"
              v-bind="restTabProps"
              :prefix-cls="tabPanePrefixCls"
              :id="id"
              :tab-key="key"
              :animated="tabPaneAnimated"
              :active="key === activeKey"
              :style="{ ...contentStyle, ...paneStyle, ...motionStyle }"
              :class="clsx(contentClassName, paneClassName, motionClassName)"
            />
          </template>
        </CSSMotion>
      </template>
    </div>
  </div>
</template>
