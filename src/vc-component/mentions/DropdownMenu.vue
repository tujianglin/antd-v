<script lang="tsx" setup>
import type { MenuRef } from '@/vc-component/menu';
import Menu from '@/vc-component/menu';
import type { ItemType } from '@/vc-component/menu/interface';
import { computed, ref, toRefs, watch } from 'vue';
import type { DataDrivenOptionProps } from './Mentions.vue';
import { useMentionsContextInject } from './MentionsContext';

export interface DropdownMenuProps {
  prefixCls?: string;
  options: DataDrivenOptionProps[];
  opened: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, options, opened } = defineProps<DropdownMenuProps>();

const { notFoundContent, activeIndex, selectOption, onFocus, onBlur, onScroll } = toRefs(useMentionsContextInject());

const activeOption = computed(() => options[activeIndex?.value] || {});
const menuRef = ref<MenuRef>(null);

// Monitor the changes in ActiveIndex and scroll to the visible area if there are any changes
watch(
  [activeIndex, () => activeOption.value.key, () => opened],
  () => {
    if (activeIndex.value === -1 || !menuRef.value || !opened) {
      return;
    }

    const activeItem = menuRef.value?.findItem?.({ key: activeOption.value.key });
    if (activeItem) {
      activeItem.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  },
  { immediate: true, deep: true },
);

const getItems = () => {
  if (!options?.length) {
    return [
      {
        type: 'item',
        key: 'notFoundContent',
        disabled: true,
        label: notFoundContent.value,
      },
    ] as ItemType[];
  }
  return options?.map((option, index) => ({
    ...option,
    onMouseenter: () => {
      activeIndex.value = index;
    },
  })) as ItemType[];
};
</script>
<template>
  <Menu
    ref="menuRef"
    :prefix-cls="`${prefixCls}-menu`"
    :active-key="activeOption?.key"
    @select="
      ({ key }) => {
        const option = options.find(({ key: optionKey }) => optionKey === key);
        selectOption?.(option);
      }
    "
    @focus="onFocus"
    @blur="onBlur"
    @scroll="onScroll"
    :items="getItems()"
  />
</template>
