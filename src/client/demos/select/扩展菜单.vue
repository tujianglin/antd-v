<script lang="tsx" setup>
import { Button, Divider, Input, Select, Space, type InputRef } from '@/components';
import { PlusOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const items = ref(['jack', 'lucy']);
const name = ref('');
const inputRef = ref<InputRef>(null);
let index = 0;
const onNameChange = (event) => {
  name.value = event.target.value;
};

const addItem = (e: MouseEvent) => {
  e.preventDefault();
  items.value = [...items.value, name.value || `New item ${index++}`];
  name.value = '';
  setTimeout(() => {
    inputRef.value?.focus();
  }, 0);
};

const popupRender = (menu) => (
  <>
    {menu}
    <Divider style={{ margin: '8px 0' }} />
    <Space style={{ padding: '0 8px 4px' }}>
      <Input
        placeholder="Please enter item"
        ref={inputRef}
        value={name.value}
        onChange={onNameChange}
        onKeydown={(e) => e.stopPropagation()}
      />
      <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
        Add item
      </Button>
    </Space>
  </>
);
</script>
<template>
  <Select
    class="!w-100"
    placeholder="custom dropdown render"
    :popup-render="popupRender"
    :options="items.map((item) => ({ label: item, value: item }))"
  />
</template>
