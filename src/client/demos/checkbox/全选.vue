<script lang="tsx" setup>
import type { CheckboxProps } from '@/components';
import { Checkbox, Divider } from '@/components';
import { computed, ref } from 'vue';

const CheckboxGroup = Checkbox.Group;

const plainOptions = ['Apple', 'Pear', 'Orange'];
const defaultCheckedList = ['Apple', 'Orange'];

const checkedList = ref<string[]>(defaultCheckedList);

const checkAll = computed(() => plainOptions.length === checkedList.value.length);
const indeterminate = computed(() => checkedList.value.length > 0 && checkedList.value.length < plainOptions.length);

const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
  checkedList.value = e.target.checked ? plainOptions : [];
};
</script>
<template>
  <Checkbox :indeterminate="indeterminate" @change="onCheckAllChange" :checked="checkAll"> Check all </Checkbox>
  <Divider />
  <CheckboxGroup :options="plainOptions" v-model:value="checkedList" />
</template>
