<script lang="tsx" setup>
import { Render } from '@/components';
import clsx from 'clsx';
import { computed, toRefs } from 'vue';
import { useCascaderContextInject } from '../context';
export interface CheckboxProps {
  prefixCls: string;
  checked?: boolean;
  halfChecked?: boolean;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  disableCheckbox?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { prefixCls, checked, halfChecked, disabled, onClick, disableCheckbox } = defineProps<CheckboxProps>();

const { checkable } = toRefs(useCascaderContextInject());

const customCheckbox = computed(() => (typeof checkable.value !== 'boolean' ? checkable : null));
</script>
<template>
  <span
    :class="
      clsx(`${prefixCls}`, {
        [`${prefixCls}-checked`]: checked,
        [`${prefixCls}-indeterminate`]: !checked && halfChecked,
        [`${prefixCls}-disabled`]: disabled || disableCheckbox,
      })
    "
    @click="onClick"
  >
    <Render :content="customCheckbox" />
  </span>
</template>
