import { Button, ConfigProvider, Input, Space } from '@/components';
import { SearchOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <ConfigProvider>
        <Space orientation="vertical" size="middle">
          <Space.Compact>
            <Input defaultValue="26888888" />
          </Space.Compact>
          <Space.Compact>
            <Input style={{ width: '20%' }} defaultValue="0571" />
            <Input style={{ width: '80%' }} defaultValue="26888888" />
          </Space.Compact>
          <Space.Compact style={{ width: '100%' }}>
            <Input defaultValue="Combine input and button" />
            <Button type="primary">Submit</Button>
          </Space.Compact>
          <Space.Compact>
            <Input defaultValue="Xihu District, Hangzhou" />
          </Space.Compact>
          <Space.Compact size="large">
            <Input addonBefore={<SearchOutlined />} placeholder="large size" />
            <Input placeholder="another input" />
          </Space.Compact>
        </Space>
      </ConfigProvider>
    );
  },
});
