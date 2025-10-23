<script lang="tsx" setup>
import { Button, message, Upload, type UploadProps } from '@/components';
import { UploadOutlined } from '@ant-design/icons-vue';

const props: UploadProps = {
  name: 'file',
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};
</script>
<template>
  <Upload v-bind="props">
    <Button :icon="UploadOutlined">Click to Upload</Button>
  </Upload>
</template>
