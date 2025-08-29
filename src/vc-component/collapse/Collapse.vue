<script lang="tsx" setup>
import { Render } from '@/components';
import pickAttrs from '@/vc-util/pickAttrs';
import clsx from 'clsx';
import { computed, ref, watch } from 'vue';
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

function getActiveKeysArray(activeKey: PropertyKey | PropertyKey[]) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    const activeKeyType = typeof currentActiveKey;
    currentActiveKey = activeKeyType === 'number' || activeKeyType === 'string' ? [currentActiveKey] : [];
  }
  return currentActiveKey.map((key) => String(key));
}

const collapseClassName = computed(() => clsx(prefixCls, className));

const activeKey = defineModel<PropertyKey[]>('activeKey', {
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
const onItemClick = (key: PropertyKey) => {
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

const mergedChildren = () => {
  return useItems(items, {
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
  });
};

const domRef = ref(null);
</script>
<template>
  <div
    ref="domRef"
    :class="collapseClassName"
    :style="style"
    :role="accordion ? 'tablist' : undefined"
    v-bind="pickAttrs($props, { aria: true, data: true })"
  >
    <Render :content="mergedChildren" />
  </div>
</template>
