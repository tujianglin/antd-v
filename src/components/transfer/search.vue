<script lang="tsx" setup>
import { SearchOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
import Input from '../input/Input.vue';

export interface TransferSearchProps {
  prefixCls?: string;
  placeholder?: string;
  onChange?: (e) => void;
  handleClear?: () => void;
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { placeholder = '', prefixCls, disabled, onChange, handleClear } = defineProps<TransferSearchProps>();

const value = defineModel<string>('value');

const handleChange = (e) => {
  onChange?.(e);
  if (e.target.value === '') {
    handleClear?.();
  }
};
</script>
<template>
  <Input
    :placeholder="placeholder"
    :class="prefixCls"
    v-model:value="value"
    @input="handleChange"
    :disabled="disabled"
    :prefix="() => h(SearchOutlined)"
  />
</template>
