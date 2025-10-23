<script lang="tsx" setup>
import { Divider, Flex, Tag } from '@/components';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue';

const variants = ['filled', 'solid', 'outlined'] as const;
const presets = [
  { status: 'success', icon: <CheckCircleOutlined /> },
  { status: 'processing', icon: <SyncOutlined spin /> },
  { status: 'warning', icon: <ExclamationCircleOutlined /> },
  { status: 'error', icon: <CloseCircleOutlined /> },
  { status: 'default', icon: <ClockCircleOutlined /> },
];
</script>
<template>
  <div v-for="variant in variants" :key="variant">
    <Divider title-placement="start">Status ({{ variant }})</Divider>
    <Flex gap="small" align="center" wrap>
      <Tag v-for="{ status, icon } in presets" :key="status" :color="status" :icon="icon" :variant="variant">
        {{ status }}
      </Tag>
    </Flex>
  </div>
</template>
