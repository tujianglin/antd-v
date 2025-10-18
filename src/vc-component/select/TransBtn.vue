<script lang="tsx" setup>
import Render from '@/vc-component/render';
import clsx from 'clsx';
import { computed, type CSSProperties } from 'vue';

export interface TransBtnProps {
  class: string;
  style?: CSSProperties;
  customizeIcon: any;
  customizeIconProps?: any;
  onMousedown?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
}

defineOptions({ name: 'TransBtn', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { class: className, style, customizeIcon, customizeIconProps, onMousedown, onClick } = defineProps<TransBtnProps>();

const icon = computed(() => (typeof customizeIcon === 'function' ? customizeIcon(customizeIconProps) : customizeIcon));
</script>
<template>
  <span
    :class="className"
    @mousedown="
      (event) => {
        event.preventDefault();
        onMousedown?.(event);
      }
    "
    :style="{ userSelect: 'none', WebkitUserSelect: 'none', ...style }"
    unselectable="on"
    @click="onClick"
    aria-hidden
  >
    <Render v-if="icon" :content="icon" />
    <span v-else :class="clsx(className.split(/\s+/).map((cls) => `${cls}-icon`))">
      <slot></slot>
    </span>
  </span>
</template>
