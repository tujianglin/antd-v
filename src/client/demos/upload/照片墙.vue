<script lang="tsx" setup>
import { Image, Upload, type UploadFile, type UploadProps } from '@/components';
import { PlusOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

type FileType = Parameters<UploadProps['beforeUpload']>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const previewOpen = ref(false);
const previewImage = ref('');
const fileList = ref<UploadFile[]>([
  {
    uid: '-1',
    name: 'image.png',
    status: 'done',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: '-2',
    name: 'image.png',
    status: 'done',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: '-3',
    name: 'image.png',
    status: 'done',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: '-4',
    name: 'image.png',
    status: 'done',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: '-xxx',
    percent: 50,
    name: 'image.png',
    status: 'uploading',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: '-5',
    name: 'image.png',
    status: 'error',
  },
]);

const handlePreview = async (file: UploadFile) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj as FileType);
  }

  previewImage.value = file.url || (file.preview as string);
  previewOpen.value = true;
};

const UploadButton = () => (
  <button style={{ border: 0, background: 'none' }} type="button">
    <PlusOutlined />
    <div style={{ marginTop: '8px' }}>Upload</div>
  </button>
);
</script>
<template>
  <Upload
    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
    list-type="picture-card"
    v-model:file-list="fileList"
    @preview="handlePreview"
  >
    <UploadButton v-if="fileList.length < 8" />
  </Upload>
  <Image
    v-if="previewImage"
    :styles="{ root: { display: 'none' } }"
    :preview="{
      open: previewOpen,
      onOpenChange: (visible) => (previewOpen = visible),
      afterOpenChange: (visible) => !visible && (previewImage = ''),
    }"
    :src="previewImage"
  />
</template>
