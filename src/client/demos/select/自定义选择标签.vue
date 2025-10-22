<script lang="tsx" setup>
import { Select, Tag, type SelectProps } from '@/components';

const options: SelectProps['options'] = [{ value: 'gold' }, { value: 'lime' }, { value: 'green' }, { value: 'cyan' }];

const tagRender = (props) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color={value}
      onMousedown={onPreventMouseDown}
      closeIcon={closable}
      onClose={onClose}
      style={{ marginInlineEnd: `${4}px` }}
    >
      {label}
    </Tag>
  );
};
</script>
<template>
  <Select mode="multiple" :tag-render="tagRender" :value="['gold', 'cyan']" class="!w-full" :options="options" />
</template>
