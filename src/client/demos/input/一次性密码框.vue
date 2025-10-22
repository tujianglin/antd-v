<script lang="tsx" setup>
import { Flex, Input } from '@/components';
import { h } from 'vue';

const onChange = (text) => {
  console.log('onChange:', text);
};

const onInput = (value) => {
  console.log('onInput:', value);
};

const sharedProps = {
  onChange,
  onInput,
};
</script>
<template>
  <Flex gap="middle" align="flex-start" vertical>
    <Input.OTP :formatter="(str) => str.toUpperCase()" v-bind="sharedProps" />
    <Input.OTP disabled v-bind="sharedProps" />
    <Input.OTP :length="8" v-bind="sharedProps" />
    <Input.OTP variant="filled" v-bind="sharedProps" />
    <Input.OTP mask="🔒" v-bind="sharedProps" />
    <Input.OTP :separator="h('span', {}, '/')" v-bind="sharedProps" />
    <Input.OTP :separator="(i) => h('span', { style: { color: i % 2 ? 'red' : 'blur' } }, '-')" v-bind="sharedProps" />
  </Flex>
</template>
