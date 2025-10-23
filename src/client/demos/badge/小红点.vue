<script lang="tsx" setup>
import { Badge, Space } from '@/components';
import { NotificationOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Space>
    <Badge dot>
      <NotificationOutlined :style="{ fontSize: `${16}px` }" />
    </Badge>
    <Badge dot>
      <a href="#">Link something</a>
    </Badge>
  </Space>
</template>
