<script lang="tsx" setup>
import { Flex, Input } from '@/components';

const { TextArea } = Input;

const onChange = (e) => {
  console.log('Change:', e.target.value);
};
</script>
<template>
  <Flex vertical :gap="32">
    <Input show-count :maxlength="20" @change="onChange" />
    <TextArea show-count :maxlength="100" @change="onChange" placeholder="can resize" />
    <TextArea
      show-count
      :maxlength="100"
      @change="onChange"
      placeholder="disable resize"
      :style="{ height: `${120}px`, resize: 'none' }"
    />
  </Flex>
</template>
