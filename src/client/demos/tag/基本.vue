<script lang="tsx" setup>
import { Flex, Tag } from '@/components';
import { CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const preventDefault = (e: MouseEvent) => {
  e.preventDefault();
  console.log('Clicked! But prevent default.');
};
</script>
<template>
  <Flex gap="small" align="center" wrap>
    <Tag>Tag 1</Tag>
    <Tag>
      <a href="https://github.com/ant-design/ant-design/issues/1862" target="_blank" rel="noopener noreferrer"> Link </a>
    </Tag>
    <Tag :close-icon="true" @close="preventDefault"> Prevent Default </Tag>
    <Tag :close-icon="CloseCircleOutlined"> Tag 2 </Tag>
    <Tag :close-icon="DeleteOutlined"> Tag 3 </Tag>
  </Flex>
</template>
