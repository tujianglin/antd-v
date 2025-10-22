<script lang="tsx" setup>
import { Button, Input, Space } from '@/components';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons-vue';
import { h, ref } from 'vue';

const passwordVisible = ref(false);
</script>
<template>
  <Space vertical>
    <Input.Password placeholder="input password" />
    <Input.Password
      placeholder="input password"
      :icon-render="(visible) => (visible ? h(EyeTwoTone) : h(EyeInvisibleOutlined))"
    />
    <Space>
      <Input.Password
        placeholder="input password"
        :visibility-toggle="{ visible: passwordVisible, onVisibleChange: (visible) => (passwordVisible = visible) }"
      />
      <Button class="!w-20" @click="() => (passwordVisible = !passwordVisible)">
        {{ passwordVisible ? 'Hide' : 'Show' }}
      </Button>
    </Space>
    <Input.Password disabled placeholder="disabled input password" />
  </Space>
</template>
