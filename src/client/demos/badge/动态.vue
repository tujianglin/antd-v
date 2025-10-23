<script lang="tsx" setup>
import { Avatar, Badge, Button, Space, Switch } from '@/components';
import { MinusOutlined, PlusOutlined, QuestionOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const count = ref(5);
const show = ref(true);

const increase = () => {
  count.value = count.value + 1;
};

const decline = () => {
  let newCount = count.value - 1;
  if (newCount < 0) {
    newCount = 0;
  }
  count.value = newCount;
};

const random = () => {
  const newCount = Math.floor(Math.random() * 100);
  count.value = newCount;
};
</script>
<template>
  <Space vertical>
    <Space size="large">
      <Badge :count="count">
        <Avatar shape="square" size="large" />
      </Badge>
      <Space.Compact>
        <Button @click="decline" :icon="MinusOutlined" />
        <Button @click="increase" :icon="PlusOutlined" />
        <Button @click="random" :icon="QuestionOutlined" />
      </Space.Compact>
    </Space>
    <Space size="large">
      <Badge :dot="show">
        <Avatar shape="square" size="large" />
      </Badge>
      <Switch v-model:checked="show" />
    </Space>
  </Space>
</template>
