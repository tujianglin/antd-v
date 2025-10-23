<script lang="tsx" setup>
import { Flex, message, Upload, type UploadProps } from '@/components';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
type FileType = Parameters<UploadProps['beforeUpload']>[0];
const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const loading = ref(false);
const imageUrl = ref<string>();

const handleChange: UploadProps['onChange'] = (info) => {
  if (info.file.status === 'uploading') {
    loading.value = true;
    return;
  }
  if (info.file.status === 'done') {
    // Get this url from response in real world.
    getBase64(info.file.originFileObj as FileType, (url) => {
      loading.value = false;
      imageUrl.value = url;
    });
  }
};

const UploadButton = () => (
  <button style={{ border: 0, background: 'none' }} type="button">
    {loading.value ? <LoadingOutlined /> : <PlusOutlined />}
    <div style={{ marginTop: '8px' }}>Upload</div>
  </button>
);
</script>
<template>
  <Flex gap="middle" wrap>
    <Upload
      name="avatar"
      list-type="picture-card"
      class="avatar-uploader"
      :show-upload-list="false"
      action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
      :before-upload="beforeUpload"
      @change="handleChange"
    >
      <img v-if="imageUrl" :draggable="false" :src="imageUrl" alt="avatar" class="w-full" />
      <UploadButton v-else />
    </Upload>
    <Upload
      name="avatar"
      list-type="picture-circle"
      class="avatar-uploader"
      :show-upload-list="false"
      action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
      :before-upload="beforeUpload"
      @change="handleChange"
    >
      <img v-if="imageUrl" :draggable="false" :src="imageUrl" alt="avatar" class="w-full" />
      <UploadButton v-else />
    </Upload>
  </Flex>
</template>
