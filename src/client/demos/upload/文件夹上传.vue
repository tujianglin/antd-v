<script lang="tsx" setup>
import { Button, Upload } from '@/components';
import { UploadOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <Upload action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload" :webkitdirectory="true">
    <Button :icon="UploadOutlined">Upload Directory</Button>
  </Upload>
</template>
