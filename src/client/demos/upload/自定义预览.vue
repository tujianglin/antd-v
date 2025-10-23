<script lang="tsx" setup>
import { Button, Upload, type UploadProps } from '@/components';
import { UploadOutlined } from '@ant-design/icons-vue';

const props: UploadProps = {
  action: '//jsonplaceholder.typicode.com/posts/',
  listType: 'picture',
  previewFile(file) {
    console.log('Your upload file:', file);
    // Your process logic. Here we just mock to the same file
    return fetch('https://next.json-generator.com/api/json/get/4ytyBoLK8', {
      method: 'POST',
      body: file,
    })
      .then((res) => res.json())
      .then(({ thumbnail }) => thumbnail);
  },
};
</script>
<template>
  <Upload v-bind="props">
    <Button :icon="UploadOutlined">Upload</Button>
  </Upload>
</template>
