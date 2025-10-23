<script lang="tsx" setup>
import { Collapse, Space } from '@/components';

const text = (
  <p style={{ paddingInlineStart: 24 }}>
    A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many
    households across the world.
  </p>
);
</script>
<template>
  <Space vertical>
    <Collapse
      collapsible="header"
      :items="[
        {
          key: '1',
          label: 'This panel can be collapsed by clicking text or icon',
          children: text,
        },
      ]"
    />
    <Collapse
      collapsible="icon"
      :items="[
        {
          key: '1',
          label: 'This panel can only be collapsed by clicking icon',
          children: text,
        },
      ]"
    />
    <Collapse
      collapsible="disabled"
      :items="[
        {
          key: '1',
          label: 'This panel cant be collapsed',
          children: text,
        },
      ]"
    />
  </Space>
</template>
