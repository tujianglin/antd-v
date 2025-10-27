<script setup lang="tsx">
import { Button, Flex, Splitter, Switch, Typography } from '@/components';
import { ref } from 'vue';

const Desc = (props: { text?: string | number }) => (
  <Flex justify="center" align="center" style={{ height: '100%' }}>
    <Typography.Title type="secondary" level={5} style={{ whiteSpace: 'nowrap' }}>
      {props.text}
    </Typography.Title>
  </Flex>
);

const sizes = ref<(number | string)[]>(['50%', '50%']);
const enabled = ref(true);

const setSizes = (newSizes: (number | string)[]) => {
  sizes.value = newSizes;
};
</script>

<template>
  <Flex vertical gap="middle">
    <Splitter @resize="setSizes" style="height: 200px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)">
      <Splitter.Panel :size="sizes[0]" :resizable="enabled">
        <Desc text="First" />
      </Splitter.Panel>
      <Splitter.Panel :size="sizes[1]">
        <Desc text="Second" />
      </Splitter.Panel>
    </Splitter>
    <Flex gap="middle" justify="space-between">
      <Switch v-model:checked="enabled" checked-children="Enabled" un-checked-children="Disabled" />
      <Button @click="setSizes(['50%', '50%'])">Reset</Button>
    </Flex>
  </Flex>
</template>
