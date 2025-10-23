<script lang="tsx" setup>
import { Button, Upload, type UploadFile } from '@/components';
import { UploadOutlined } from '@ant-design/icons-vue';

const fileList: UploadFile[] = [
  {
    uid: '0',
    name: 'xxx.png',
    status: 'uploading',
    percent: 33,
  },
  {
    uid: '-1',
    name: 'yyy.png',
    status: 'done',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: '-2',
    name: 'zzz.png',
    status: 'error',
  },
];
</script>
<template>
  <Upload action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload" list-type="picture" :file-list="fileList">
    <Button type="primary" :icon="UploadOutlined">Upload</Button>
  </Upload>
</template>
