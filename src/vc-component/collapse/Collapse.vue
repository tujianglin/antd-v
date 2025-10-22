<script lang="tsx" setup>
import Render from '@/vc-component/render';
import pickAttrs from '@/vc-util/pickAttrs';
import type { VueKey } from '@/vc-util/type';
import clsx from 'clsx';
import { computed, watch } from 'vue';
import useItems from './hooks/useItems';
import type { CollapseProps } from './interface';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const {
  prefixCls = 'rc-collapse',
  destroyOnHidden = false,
  style,
  accordion,
  class: className,
  collapsible,
  openMotion,
  expandIcon,
  onChange,
  items,
  classNames: customizeClassNames,
  styles,
} = defineProps<CollapseProps>();

function getActiveKeysArray(activeKey: VueKey | VueKey[]) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    const activeKeyType = typeof currentActiveKey;
    currentActiveKey = activeKeyType === 'number' || activeKeyType === 'string' ? [currentActiveKey] : [];
  }
  return currentActiveKey.map((key) => String(key));
}

const collapseClassName = computed(() => clsx(prefixCls, className));

const activeKey = defineModel<VueKey[]>('activeKey', {
  get(v) {
    return getActiveKeysArray(v);
  },
});

watch(
  activeKey,
  (val) => {
    onChange?.(val);
  },
  { deep: true },
);
const onItemClick = (key: VueKey) => {
  if (accordion) {
    activeKey.value = activeKey.value[0] === key ? [] : [key];
    return;
  }
  const index = activeKey.value.indexOf(key);
  const isActive = index > -1;
  if (isActive) {
    activeKey.value = activeKey.value.filter((item) => item !== key);
    return;
  }

  activeKey.value = [...activeKey.value, key];
};

const mergedChildren = computed(() =>
  useItems(items, {
    prefixCls,
    accordion,
    openMotion,
    expandIcon,
    collapsible,
    destroyOnHidden,
    onItemClick,
    activeKey: activeKey.value,
    classNames: customizeClassNames,
    styles,
  }),
);
</script>
<template>
  <div
    :class="collapseClassName"
    :style="style"
    :role="accordion ? 'tablist' : undefined"
    v-bind="pickAttrs($props, { aria: true, data: true })"
  >
    <Render :content="mergedChildren" />
  </div>
</template>
