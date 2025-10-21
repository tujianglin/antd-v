<script lang="tsx" setup>
import { DownOutlined } from '@ant-design/icons-vue';
import { Button, Divider, Dropdown, Space, theme } from '@/components';
import type { MenuProps } from '@/components';
import type { CSSProperties } from 'vue';
import { cloneElement } from '@/vc-util/Children/util';

const { useToken } = theme;

const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
        1st menu item
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
        2nd menu item (disabled)
      </a>
    ),
    disabled: true,
  },
  {
    key: '3',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
        3rd menu item (disabled)
      </a>
    ),
    disabled: true,
  },
];

const { token } = useToken();

const contentStyle: CSSProperties = {
  backgroundColor: token.value.colorBgElevated,
  borderRadius: token.value.borderRadiusLG,
  boxShadow: token.value.boxShadowSecondary,
};

const menuStyle: CSSProperties = {
  boxShadow: 'none',
};

const popupRender = (menu) => (
  <div style={contentStyle}>
    {cloneElement(menu, { style: menuStyle })}
    <Divider style={{ margin: 0 }} />
    <Space style={{ padding: '8px' }}>
      <Button type="primary">Click me!</Button>
    </Space>
  </div>
);
</script>
<template>
  <Dropdown :menu="{ items }" :popup-render="popupRender">
    <a @click="(e) => e.preventDefault()">
      <Space>
        Hover me
        <DownOutlined />
      </Space>
    </a>
  </Dropdown>
</template>
