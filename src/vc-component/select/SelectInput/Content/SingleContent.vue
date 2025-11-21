<script lang="tsx" setup>
import { Render } from '@/components';
import { clsx } from 'clsx';
import { computed, getCurrentInstance, ref, toRefs, watch, type HTMLAttributes } from 'vue';
import { useBaseSelectContextInject } from '../../hooks/useBaseProps';
import { useSelectContextInject } from '../../SelectContext';
import { getTitle } from '../../utils/commonUtil';
import { useSelectInputContextInject } from '../context';
import Input from '../Input.vue';
import type { SharedContentProps } from './index.vue';
import Placeholder from './Placeholder.vue';

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { inputProps } = defineProps<SharedContentProps>();

const { prefixCls, searchValue, activeValue, displayValues, maxlength, mode } = toRefs(useSelectInputContextInject());
const { triggerOpen, title: rootTitle, showSearch, classNames, styles } = toRefs(useBaseSelectContextInject());
const selectContext = useSelectContextInject();

const inputChanged = ref(false);

const combobox = computed(() => mode?.value === 'combobox');
const displayValue = computed(() => displayValues.value?.[0]);

// Implement the same logic as the old SingleSelector
const mergedSearchValue = computed(() => {
  if (combobox.value && activeValue?.value && !inputChanged.value && triggerOpen?.value) {
    return activeValue?.value;
  }

  return showSearch?.value ? searchValue?.value : '';
});

// Extract option props, excluding label and value, and handle className/style merging
const optionProps = computed(() => {
  let restProps: HTMLAttributes = {
    class: `${prefixCls.value}-content-value`,
    style: {
      visibility: mergedSearchValue.value ? 'hidden' : 'visible',
    },
  };

  if (displayValue?.value && selectContext?.flattenOptions) {
    const option = selectContext.flattenOptions.find((opt) => opt.value === displayValue.value);
    if (option?.data) {
      const { label: _, value: _1, className, style, key: _key, ...rest } = option.data;

      restProps = {
        ...restProps,
        ...rest,
        title: getTitle(option.data),
        class: clsx(restProps.class, className),
        style: { ...(restProps.style as any), ...style },
      };
    }
  }

  if (displayValue?.value && !restProps.title) {
    restProps.title = getTitle(displayValue?.value);
  }

  if (rootTitle?.value !== undefined) {
    restProps.title = rootTitle?.value;
  }

  return restProps;
});

watch([combobox, activeValue], () => {
  if (combobox.value) {
    inputChanged.value = false;
  }
});

const vm = getCurrentInstance();

const changeRef = (el) => {
  vm.exposed = el || {};
  vm.exposeProxy = el || {};
};
</script>
<template>
  <div :class="clsx(`${prefixCls}-content`, classNames?.content)" :style="styles?.content">
    <div v-if="displayValue" v-bind="optionProps">
      <Render :content="displayValue.label" />
    </div>
    <Placeholder v-else :show="!mergedSearchValue" />
    <Input
      :ref="changeRef"
      v-bind="inputProps as any"
      :value="mergedSearchValue"
      :maxlength="mode === 'combobox' ? maxlength : undefined"
      @change="
        (e) => {
          inputChanged = true;
          inputProps.onChange?.(e);
        }
      "
    />
  </div>
</template>
