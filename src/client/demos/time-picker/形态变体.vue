<script lang="tsx" setup>
import { Flex, TimePicker } from '@/components';

const { RangePicker } = TimePicker;
</script>
<template>
  <Flex vertical :gap="12">
    <Flex :gap="8">
      <TimePicker placeholder="Outlined" />
      <RangePicker :placeholder="['Outlined Start', 'Outlined End']" />
    </Flex>
    <Flex :gap="8">
      <TimePicker variant="filled" placeholder="Filled" />
      <RangePicker variant="filled" :placeholder="['Filled Start', 'Filled End']" />
    </Flex>
    <Flex :gap="8">
      <TimePicker variant="borderless" placeholder="Borderless" />
      <RangePicker variant="borderless" :placeholder="['Borderless Start', 'Borderless End']" />
    </Flex>
    <Flex :gap="8">
      <TimePicker variant="underlined" placeholder="Underlined" />
      <RangePicker variant="underlined" :placeholder="['Underlined Start', 'Underlined End']" />
    </Flex>
  </Flex>
</template>
