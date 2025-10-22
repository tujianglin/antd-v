<script lang="tsx" setup>
import { Flex, Radio } from '@/components';
import type { CheckboxGroupProps } from '@/components/checkbox/Group.vue';

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange' },
];
</script>
<template>
  <Flex vertical gap="middle">
    <Radio.Group block :options="options" value="Apple" />
    <Radio.Group block :options="options" value="Apple" option-type="button" button-style="solid" />
    <Radio.Group block :options="options" value="Pear" option-type="button" />
  </Flex>
</template>
