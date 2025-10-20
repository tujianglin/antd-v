<script lang="tsx" setup>
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import { onMounted, ref, type CSSProperties } from 'vue';

export interface DrawerPanelRef {
  focus: VoidFunction;
}

export interface DrawerPanelEvents {
  onMouseenter?: (e: MouseEvent) => void;
  onMouseover?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onKeyup?: (e: KeyboardEvent) => void;
}

export interface DrawerPanelProps extends DrawerPanelEvents {
  prefixCls: string;
  class?: string;
  id?: string;
  style?: CSSProperties;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, class: className, ...restProps } = defineProps<DrawerPanelProps>();
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>
<template>
  <div
    :class="clsx(`${prefixCls}-section`, className)"
    role="dialog"
    aria-modal="true"
    v-bind="{ ...pickAttrs($props, { aria: true }), ...restProps }"
  >
    <slot v-if="isMounted"></slot>
  </div>
</template>
