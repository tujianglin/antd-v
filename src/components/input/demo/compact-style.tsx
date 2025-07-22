import { Button, Input, Space } from '@/components';
import { SearchOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return () => (
      <Space vertical size="middle">
        <Space.Compact>
          <Input value="26888888" />
        </Space.Compact>
        <Space.Compact>
          <Input style={{ width: '20%' }} value="0571" />
          <Input style={{ width: '80%' }} value="26888888" />
        </Space.Compact>
        <Space.Compact>
          <Input.Search addonBefore="https://" placeholder="input search text" allowClear />
        </Space.Compact>
        <Space.Compact style={{ width: '100%' }}>
          <Input value="Combine input and button" />
          <Button type="primary">Submit</Button>
        </Space.Compact>
        <Space.Compact>
          {/* <Select value="Zhejiang" options={options} /> */}
          <Input value="Xihu District, Hangzhou" />
        </Space.Compact>
        <Space.Compact size="large">
          <Input addonBefore={<SearchOutlined />} placeholder="large size" />
          <Input placeholder="another input" />
        </Space.Compact>
      </Space>
    );
  },
});
