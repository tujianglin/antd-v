<script lang="tsx" setup>
import { Avatar } from '@/components';
import { AntDesignOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Avatar :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }" :icon="AntDesignOutlined" />
</template>
