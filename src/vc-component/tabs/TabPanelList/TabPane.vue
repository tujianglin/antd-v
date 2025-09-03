<script lang="tsx" setup>
import { Render } from '@/components';
import clsx from 'clsx';
import { useTemplateRef, type CSSProperties } from 'vue';

export interface TabPaneProps {
  tab?: any;
  class?: string;
  style?: CSSProperties;
  disabled?: boolean;
  children?: any;
  forceRender?: boolean;
  closable?: boolean;
  closeIcon?: any;
  icon?: any;

  // Pass by TabPaneList
  prefixCls?: string;
  tabKey?: string;
  id?: string;
  animated?: boolean;
  active?: boolean;
  destroyOnHidden?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, class: className, style, id, active, tabKey, children } = defineProps<TabPaneProps>();

const domRef = useTemplateRef('domRef');

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <div
    :id="id && `${id}-panel-${tabKey}`"
    role="tabpanel"
    :tabindex="active ? 0 : -1"
    :aria-labelledby="id && `${id}-tab-${tabKey}`"
    :aria-hidden="!active"
    :style="style"
    :class="clsx(prefixCls, active && `${prefixCls}-active`, className)"
    ref="domRef"
  >
    <Render :content="children" />
  </div>
</template>
