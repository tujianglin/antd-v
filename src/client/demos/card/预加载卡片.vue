<script lang="tsx" setup>
import { Avatar, Card, Flex, Switch } from '@/components';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { h, ref } from 'vue';

const loading = ref(true);

const actions = [<EditOutlined key="edit" />, <SettingOutlined key="setting" />, <EllipsisOutlined key="ellipsis" />];

const description = (
  <>
    <p>This is the description</p>
    <p>This is the description</p>
  </>
);
</script>
<template>
  <Flex gap="middle" align="start" vertical>
    <Switch v-model:checked="loading" />
    <Card :loading="loading" :actions="actions" class="!w-[300px]">
      <Card.Meta title="Card title" :description="description" />
    </Card>
    <Card :loading="loading" :actions="actions" class="!w-[300px]">
      <Card.Meta
        :avatar="h(Avatar, { src: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2' })"
        title="Card title"
        :description="description"
      />
    </Card>
  </Flex>
</template>
