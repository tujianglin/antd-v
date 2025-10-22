<script lang="tsx" setup>
import { Checkbox } from '@/components';

const onChange = (checkedValues) => {
  console.log('checked = ', checkedValues);
};

const plainOptions = ['Apple', 'Pear', 'Orange'];

const options = [
  { label: 'Apple', value: 'Apple', className: 'label-1' },
  { label: 'Pear', value: 'Pear', className: 'label-2' },
  { label: 'Orange', value: 'Orange', className: 'label-3' },
];

const optionsWithDisabled = [
  { label: 'Apple', value: 'Apple', className: 'label-1' },
  { label: 'Pear', value: 'Pear', className: 'label-2' },
  { label: 'Orange', value: 'Orange', className: 'label-3', disabled: false },
];
</script>
<template>
  <Checkbox.Group :options="plainOptions" :value="['Apple']" @change="onChange" />
  <br />
  <br />
  <Checkbox.Group :options="options" :value="['Pear']" @change="onChange" />
  <br />
  <br />
  <Checkbox.Group :options="optionsWithDisabled" disabled :value="['Apple']" @change="onChange" />
</template>
