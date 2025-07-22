import { Button, Flex, Radio, Space } from '@/components';
import { SearchOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const App = () => {
  const position = ref<'start' | 'end'>('end');

  return (
    <>
      <Space>
        <Radio.Group v-model:value={position.value}>
          <Radio.Button value="start">start</Radio.Button>
          <Radio.Button value="end">end</Radio.Button>
        </Radio.Group>
      </Space>
      <Flex gap="small" vertical>
        <Flex wrap gap="small">
          <Button type="primary" shape="circle">
            A
          </Button>
          <Button type="primary" icon={<SearchOutlined />} iconPosition={position.value}>
            Search
          </Button>
          <Button icon={<SearchOutlined />} iconPosition={position.value}>
            Search
          </Button>
        </Flex>
        <Flex wrap gap="small">
          <Button icon={<SearchOutlined />} type="text" iconPosition={position.value}>
            Search
          </Button>
          <Button type="dashed" icon={<SearchOutlined />} iconPosition={position.value}>
            Search
          </Button>
          <Button icon={<SearchOutlined />} href="https://www.google.com" target="_blank" iconPosition={position.value} />
          <Button type="primary" loading iconPosition={position.value}>
            Loading
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default App;
