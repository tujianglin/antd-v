import { Input, Space } from '@/components';
import { AudioOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';
import type { SearchProps } from '../Search.vue';

export default defineComponent({
  setup() {
    const suffix = (
      <AudioOutlined
        style={{
          fontSize: '16px',
          color: '#1677ff',
        }}
      />
    );

    const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

    return () => (
      <Space vertical>
        <Input.Search placeholder="input search text" onSearch={onSearch} style={{ width: 200 }} />
        <Input.Search placeholder="input search text" allowClear onSearch={onSearch} style={{ width: 200 }} />
        <Input.Search
          addonBefore="https://"
          placeholder="input search text"
          allowClear
          onSearch={onSearch}
          style={{ width: 304 }}
        />
        <Input.Search placeholder="input search text" onSearch={onSearch} enterButton />
        <Input.Search placeholder="input search text" allowClear enterButton="Search" size="large" onSearch={onSearch} />
        <Input.Search placeholder="input search text" enterButton="Search" size="large" suffix={suffix} onSearch={onSearch} />
      </Space>
    );
  },
});
