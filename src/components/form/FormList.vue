<script lang="tsx" setup>
import { List } from '@/vc-component/form';
import type { ValidatorRule } from '@/vc-component/form/interface';
import { computed } from 'vue';

import { omit } from 'lodash-es';
import { useConfigContextInject } from '../config-provider';
import { FormItemPrefixContextProvider } from './context';

export interface FormListFieldData {
  name: number;
  key: number;
}

export interface FormListOperation {
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export interface FormListProps {
  prefixCls?: string;
  name: string | number | (string | number)[];
  rules?: ValidatorRule[];
  initialValue?: any[];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<FormListProps>();

const { getPrefixCls } = useConfigContextInject();
const prefixCls = computed(() => getPrefixCls('form', props.prefixCls));

const contextValue = computed(() => ({
  prefixCls: prefixCls.value,
  status: 'error' as const,
}));
</script>

<template>
  <List v-bind="omit(props, ['prefixCls'])">
    <template #default="{ fields, operations, meta }">
      <FormItemPrefixContextProvider :value="contextValue">
        <slot
          :fields="fields.map((field: any) => ({ ...field, fieldKey: field.key }))"
          :operations="operations"
          :meta="meta"
        ></slot>
      </FormItemPrefixContextProvider>
    </template>
  </List>
</template>
