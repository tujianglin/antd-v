<script lang="tsx" setup>
import { computed, ref, watch, watchEffect } from 'vue';
import canUseDom from '../../vc-util/Dom/canUseDom';
import { OrderContextProvider } from './context';
import { inlineMock } from './mock';
import useDom from './useDom';
import useScrollLocker from './useScrollLocker';

export type ContainerType = Element | DocumentFragment;

export type GetContainer = string | ContainerType | (() => ContainerType) | false;

export interface PortalProps {
  /** Customize container element. Default will create a div in document.body when `open` */
  getContainer?: GetContainer;
  /** Show the portal children */
  open?: boolean;
  /** Remove `children` when `open` is `false`. Set `false` will not handle remove process */
  autoDestroy?: boolean;
  /** Lock screen scroll when open */
  autoLock?: boolean;

  /** @private debug name. Do not use in prod */
  debug?: string;
}

defineOptions({ name: 'Portal', inheritAttrs: false, compatConfig: { MODE: 3 } });

const { open, autoLock, getContainer = undefined, debug, autoDestroy = true } = defineProps<PortalProps>();

const getPortalContainer = (getContainer: GetContainer) => {
  if (getContainer === false) {
    return false;
  }

  if (!canUseDom() || !getContainer) {
    return null;
  }

  if (typeof getContainer === 'string') {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === 'function') {
    return getContainer();
  }
  return getContainer;
};

const shouldRender = ref(open);

const mergedRender = computed(() => shouldRender.value || open);

// ====================== Should Render ======================
watch(
  [() => open, () => autoDestroy],
  ([val1, val2]) => {
    if (val2 || val1) {
      shouldRender.value = val1;
    }
  },
  { immediate: true },
);

// ======================== Container ========================
const innerContainer = ref<ContainerType | false>(getPortalContainer(getContainer));

watchEffect(() => {
  const customizeContainer = getPortalContainer(getContainer);

  // Tell component that we check this in effect which is safe to be `null`
  innerContainer.value = customizeContainer ?? null;
});

const [defaultContainer, queueCreate] = useDom(
  computed(() => mergedRender.value && !innerContainer.value),
  debug,
);
const mergedContainer = computed(() => innerContainer.value ?? defaultContainer.value);

// ========================= Locker ==========================
useScrollLocker(
  computed(
    () =>
      autoLock &&
      open &&
      canUseDom() &&
      (mergedContainer.value === defaultContainer.value || mergedContainer.value === document.body),
  ),
);
// Render inline
const renderInline = computed(() => mergedContainer.value === false || inlineMock());
</script>
<template>
  <OrderContextProvider v-if="mergedRender && canUseDom() && innerContainer !== undefined" :value="queueCreate">
    <template v-if="renderInline">
      <slot></slot>
    </template>
    <Teleport v-else :to="mergedContainer || 'body'">
      <slot></slot>
    </Teleport>
  </OrderContextProvider>
</template>
