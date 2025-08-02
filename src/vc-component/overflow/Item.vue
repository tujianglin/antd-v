<script lang="tsx" setup generic="ItemType">
import clsx from 'clsx';
import { computed, onBeforeUnmount, ref, useSlots, type CSSProperties, type HTMLAttributes } from 'vue';
import { Render } from '../../components';
import type { RenderNode } from '../../components/_util/type';
import ResizeObserver from '../../vc-component/resize-observer';

export interface ItemProps<ItemType> extends /** @vue-ignore */ HTMLAttributes {
  prefixCls: string;
  item?: ItemType;
  class?: string;
  style?: CSSProperties;
  renderItem?: (item: ItemType, info: { index: number }) => RenderNode;
  responsive?: boolean;
  // https://github.com/ant-design/ant-design/issues/35475
  /**
   * @private To make node structure stable. We need keep wrap with ResizeObserver.
   * But disable it when it's no need to real measure.
   */
  responsiveDisabled?: boolean;
  itemKey?: PropertyKey;
  registerSize: (key: PropertyKey, width: number | null) => void;
  display: boolean;
  order: number;
  component?: string;
  invalidate?: boolean;
}

defineOptions({ name: 'Item', inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls,
  invalidate,
  item,
  renderItem,
  responsive,
  responsiveDisabled,
  registerSize,
  itemKey,
  class: className,
  style,
  display,
  order,
  component: Component = 'div',
  ...restProps
} = defineProps<ItemProps<ItemType>>();

// Use shared variable to save bundle size
const UNDEFINED = undefined;

const mergedHidden = computed(() => responsive && !display);

// ================================ Effect ================================
function internalRegisterSize(width: number | null) {
  registerSize(itemKey!, width);
}

onBeforeUnmount(() => {
  internalRegisterSize(null);
});

// ================================ Render ================================
const slots = useSlots();

const childNode = computed(() => (renderItem && item !== UNDEFINED ? renderItem(item, { index: order }) : slots.default));

const overflowStyle = computed(() => {
  if (!invalidate) {
    return {
      opacity: mergedHidden.value ? 0 : 1,
      height: mergedHidden.value ? 0 : UNDEFINED,
      overflowY: mergedHidden.value ? 'hidden' : UNDEFINED,
      order: responsive ? order : UNDEFINED,
      pointerEvents: mergedHidden.value ? 'none' : UNDEFINED,
      position: mergedHidden.value ? 'absolute' : UNDEFINED,
    };
  }
  return {};
});

const overflowProps = computed(() => {
  if (mergedHidden.value) {
    return {
      'aria-hidden': true,
    };
  }
  return {};
});

const domRef = ref(null);

defineExpose({
  get el() {
    return domRef.value;
  },
});
</script>
<template>
  <ResizeObserver
    v-if="responsive"
    @resize="
      ({ offsetWidth }) => {
        internalRegisterSize(offsetWidth);
      }
    "
    :disabled="responsiveDisabled"
  >
    <component
      :is="Component"
      :class="clsx(!invalidate && prefixCls, className)"
      :style="{
        ...overflowStyle,
        ...style,
      }"
      v-bind="{ ...overflowProps, ...restProps }"
      ref="domRef"
    >
      <Render :content="childNode" />
    </component>
  </ResizeObserver>
  <component
    v-else
    :is="Component"
    :class="clsx(!invalidate && prefixCls, className)"
    :style="{
      ...overflowStyle,
      ...style,
    }"
    v-bind="{ ...overflowProps, ...restProps }"
    ref="domRef"
  >
    <Render :content="childNode" />
  </component>
</template>
