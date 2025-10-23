<script lang="tsx" setup>
import { Button, Image, Space } from '@/components';
import { ref } from 'vue';

const placeholder = (
  <Image
    preview={false}
    alt="placeholder image"
    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
    width={200}
  />
);

const random = ref(Date.now());
</script>
<template>
  <Space :size="12">
    <Image
      :width="200"
      alt="basic image"
      :src="`https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?${random}`"
      :placeholder="placeholder"
    />
    <Button
      type="primary"
      @click="
        () => {
          random = Date.now();
        }
      "
    >
      Reload
    </Button>
  </Space>
</template>
