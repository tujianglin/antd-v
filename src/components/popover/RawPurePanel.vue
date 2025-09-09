<script lang="tsx" setup>
import { Popup } from '@/vc-component/tooltip';
import clsx from 'clsx';
import { computed } from 'vue';
import type { PopoverProps } from './index.vue';
import Overlay from './Overlay.vue';
interface RawPurePanelProps extends PopoverProps {
  hashId: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { hashId, prefixCls, class: className, style, placement = 'top', title, content } = defineProps<RawPurePanelProps>();
const slots = defineSlots<{ title: any; content: any; default: any }>();

const titleNode = computed(() => slots.title || title);
const contentNode = computed(() => slots.content || content);

const cls = computed(() => clsx(hashId, prefixCls, `${prefixCls}-pure`, `${prefixCls}-placement-${placement}`, className));
</script>
<template>
  <div :class="cls" :style="style">
    <div :class="`${prefixCls}-arrow`"></div>
    <Popup v-bind="$props" :class="hashId" :prefix-cls="prefixCls">
      <slot>
        <Overlay :prefix-cls="prefixCls" :title="titleNode" :content="contentNode" />
      </slot>
    </Popup>
  </div>
</template>
